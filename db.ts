import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts'

export type Image = {
  id?: number
  name: string
  originName: string
  extension: string
  date: number
  userId: string
  albumId: number
  path: string
}

export type Album = {
  id?: number
  name: string
  userId: string
}

export type User = {
  id?: string
  name: string
  isAdmin: boolean
}

export const db = new DB('./kaleidos.db')

db.execute(`
  CREATE TABLE IF NOT EXISTS images (
    id INT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    originName TEXT NOT NULL,
    extension TEXT NOT NULL,
    date INT NOT NULL,
    userId TEXT NOT NULL,
    albumId INT NOT NULL,
    path TEXT NOT NULL
  )
`)

db.execute(`
  CREATE TABLE IF NOT EXISTS albums (
    id INT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    userId TEXT NOT NULL
  )
`)

db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    isAdmin BOOL NOT NULL DEFAULT FALSE
  )
`)
