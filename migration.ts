import { join } from '$std/path/mod.ts'
import { DB } from 'sqlite'
import config from './config.ts'
import { ImagePath } from './lib/ImagePath.ts'
import { getMetadata } from './lib/process-image.ts'

const db = new DB(join(config.workingDir, 'kaleidos.db'))

type LegacyImage = {
  id: number
  name: string
  ext: string
  date: number
  userId: string
  albumId: number
  path: string
  size: number
}

const legacyImages = db.queryEntries<LegacyImage>('SELECT * FROM images')
const jobs = legacyImages.map(async (image) => {
  const imagePath = new ImagePath(image.path)
  const { width, height } = await getMetadata(imagePath.raw)
  const { userId: _userId, ...newImage } = image
  return { ...newImage, width, height }
})
const images = await Promise.all(jobs)

db.transaction(() => {
  db.execute(`
    CREATE TABLE images_new (
      id              INTEGER PRIMARY KEY NOT NULL,
      name            TEXT NOT NULL,
      ext             TEXT NOT NULL,
      date            INTEGER NOT NULL,
      albumId         INTEGER NOT NULL REFERENCES albums,
      path            TEXT NOT NULL,
      size            INTEGER NOT NULL,
      width           INTEGER NOT NULL,
      height          INTEGER NOT NULL
    );
    CREATE TABLE settings (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `)
  images.forEach((image) => {
    db.query(
      `
        INSERT INTO images_new VALUES (
          :id,
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
      image
    )
  })
  db.execute(`
    DROP TABLE images;
    ALTER TABLE images_new RENAME TO images;
  `)
})

db.close()
