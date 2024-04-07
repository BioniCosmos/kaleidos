import { join } from '$std/path/mod.ts'
import { DB } from 'sqlite'
import { ImagePath, processImage } from './ImagePath.ts'
import config from './config.ts'

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
  const { width, height } = await processImage(imagePath.raw)
  return {
    ...image,
    width,
    height,
  }
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
  images.forEach(
    ({ id, name, ext, date, albumId, path, size, width, height }) => {
      db.execute(`
      INSERT INTO images VALUES (
        ${id},
        ${name},
        ${ext},
        ${date},
        ${albumId},
        ${path},
        ${size},
        ${width},
        ${height}
      )
    `)
    }
  )
})

db.close()
