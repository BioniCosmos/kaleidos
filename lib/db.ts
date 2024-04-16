import { DB } from 'sqlite'

export type Image = {
  id: number
  name: string
  ext: string
  date: number
  albumId: number
  path: string
  size: number
  width: number
  height: number
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

export type Setting = {
  key: string
  value: string
}

export function createImageTable(db: DB) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS images(
      id              INTEGER PRIMARY KEY NOT NULL,
      name            TEXT NOT NULL,
      ext             TEXT NOT NULL,
      date            INTEGER NOT NULL,
      albumId         INTEGER NOT NULL REFERENCES albums,
      path            TEXT NOT NULL,
      size            INTEGER NOT NULL,
      width           INTEGER NOT NULL,
      height          INTEGER NOT NULL
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

export function createSettingTable(db: DB) {
  db.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    )
  `)
  db.execute(`
    INSERT OR IGNORE INTO settings VALUES ('signup', 'disable');
    INSERT OR IGNORE INTO settings VALUES ('formatPreprocess', 'disable');
    INSERT OR IGNORE INTO settings VALUES ('thumbnailPreprocess', 'disable');
  `)
}

export function getAlbumOptions(db: DB, userId: string, isAdmin: boolean) {
  // prettier-ignore
  const query = (db.queryEntries<Pick<Album, 'id' | 'name'>>).bind(db)
  const albums = isAdmin
    ? query('SELECT id, name FROM albums')
    : query('SELECT id, name FROM albums WHERE userId = :userId', { userId })
  return albums.map(({ id, name }) => ({ value: id, name }))
}

export interface SettingMap {
  signup: 'enable' | 'disable'
  formatPreprocess: 'enable' | 'disable'
  thumbnailPreprocess: 'enable' | 'disable'
}

export function getSettings(db: DB) {
  const settings = db.queryEntries<Setting>(`SELECT * FROM settings`)
  return Object.fromEntries(
    settings.map(({ key, value }) => [key, value])
  ) as unknown as SettingMap
}

export function authorizeImageOwner(
  db: DB,
  ids: Image['id'][],
  userId: User['id'],
  isAdmin: boolean
) {
  const joinedIds = ids.join(', ')
  const userIds = db.queryEntries<Pick<Album, 'userId'>>(
    `SELECT userId FROM images JOIN albums ON albumId = albums.id WHERE images.id IN (${joinedIds})`
  )
  return (
    isAdmin ||
    userIds.every(({ userId: imageUserId }) => imageUserId === userId)
  )
}

export function authorizeAlbumOwner(
  db: DB,
  id: Album['id'],
  userId: User['id'],
  isAdmin: boolean
) {
  const [{ userId: albumUserId }] = db.queryEntries<Pick<Album, 'userId'>>(
    'SELECT userId FROM albums WHERE id = ?',
    [id]
  )
  return isAdmin || albumUserId === userId
}
