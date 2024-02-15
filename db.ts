import { DB } from 'sqlite'

export type Image = {
  id: number
  name: string
  ext: string
  date: number
  userId: string
  albumId: number
  path: string
  size: number
}

export type Album = {
  id: number
  name: string
  userId: string
}

export type User = {
  id: string
  password: string
  name: string
  isAdmin: boolean
}

export function createImageTable(db: DB) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS images(
      id      INTEGER PRIMARY KEY NOT NULL,
      name    TEXT NOT NULL,
      ext     TEXT NOT NULL,
      date    INTEGER NOT NULL,
      userId  TEXT NOT NULL REFERENCES users,
      albumId INTEGER NOT NULL REFERENCES albums,
      path    TEXT NOT NULL,
      size    INTEGER NOT NULL
    )
  `)
}

export function createAlbumTable(db: DB) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS albums(
      id     INTEGER PRIMARY KEY NOT NULL,
      name   TEXT NOT NULL,
      userId TEXT NOT NULL REFERENCES users
    )
  `)
}

export function createUserTable(db: DB) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS users(
      id       TEXT PRIMARY KEY NOT NULL,
      password TEXT NOT NULL,
      name     TEXT NOT NULL,
      isAdmin  INTEGER NOT NULL DEFAULT FALSE
    )
  `)
}

export function getAlbumOptions(db: DB, userId: string) {
  return db
    .queryEntries<Pick<Album, 'id' | 'name'>>(
      'SELECT id, name FROM albums WHERE userId = :userId',
      { userId }
    )
    .map(({ id, name }) => ({ value: id, name }))
}
