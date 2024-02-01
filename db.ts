import { DB } from 'sqlite'

export type Image = {
  id: number
  name: string
  ext: string
  date: number
  userId: string
  albumId: number
  path: string
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
  CREATE TABLE IF NOT EXISTS images (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    ext TEXT NOT NULL,
    date INTEGER NOT NULL,
    userId TEXT NOT NULL,
    albumId INTEGER NOT NULL,
    path TEXT NOT NULL
  )
`)
}

export function createAlbumTable(db: DB) {
  db.execute(`
  CREATE TABLE IF NOT EXISTS albums (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    userId TEXT NOT NULL
  )
`)
}

export function createUserTable(db: DB) {
  db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    isAdmin BOOL NOT NULL DEFAULT FALSE
  )
`)
}

export const db = new DB('./kaleidos.db')

createImageTable(db)
createAlbumTable(db)
createUserTable(db)
