import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts'

export type Image = {
  id?: number
  name: string
  originName: string
  extension: string
  date: number
  userId: number
  albumId: number
  path: string
}

export const db = new DB('./kaleidos.db')

db.execute(`
  CREATE TABLE IF NOT EXISTS images (
    id INT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    originName TEXT NOT NULL,
    extension TEXT NOT NULL,
    date INT NOT NULL,
    userId INT NOT NULL,
    albumId INT NOT NULL,
    path TEXT NOT NULL
  )
`)
