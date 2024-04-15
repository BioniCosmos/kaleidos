import { ensureDirSync } from '$std/fs/mod.ts'
import { dirname, join } from '$std/path/mod.ts'
import { DB } from 'sqlite'
import config from '../config.ts'
import type { Image } from '../db.ts'
import type { OutMessage as ProcessImagesOutMessage } from './process-images.ts'

export interface InMessage {
  albumId: Image['albumId']
  images: {
    metadata: Omit<Image, 'id' | 'albumId'>
    variants: ProcessImagesOutMessage['variants']
  }[]
}

export interface OutMessage {
  lastPage: number
}

addEventListener('message', (event) => {
  const { albumId, images }: InMessage = event.data
  const db = new DB(join(config.workingDir, 'kaleidos.db'))

  images.forEach(({ metadata, variants }) => {
    const { name, ext, date, path, size, width, height } = metadata
    db.transaction(() => {
      const records = Array.of<string>()
      try {
        db.queryEntries(
          `
              INSERT INTO images VALUES (
                NULL,
                :name,
                :ext,
                :date,
                :albumId,
                :path,
                :size,
                :width,
                :height
              )
              `,
          {
            name,
            ext,
            date,
            albumId,
            path,
            size,
            width,
            height,
          } satisfies Omit<Image, 'id'>
        )

        variants.forEach(({ file, tmpFile }) => {
          ensureDirSync(dirname(file))
          Deno.copyFileSync(tmpFile, file)
          records.push(file)
        })
      } catch (error) {
        records.forEach((record) => Deno.removeSync(record))
        throw error
      } finally {
        variants.forEach(({ tmpFile }) => Deno.remove(tmpFile))
      }
    })
  })

  const [[total]] = db.query<[number]>(
    'SELECT count(*) FROM images WHERE albumId = :albumId',
    { albumId }
  )
  const lastPage = Math.ceil(total / 15)
  postMessage({ lastPage })

  db.close()
  close()
})
