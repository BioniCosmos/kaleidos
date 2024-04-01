import type { DB } from 'sqlite'
import type { Album, Image, User } from '../../db.ts'

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
