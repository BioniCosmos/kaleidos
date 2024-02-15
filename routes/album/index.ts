import type { Handlers } from '$fresh/server.ts'
import type { DB } from 'sqlite'
import type { Album } from '../../db.ts'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.ts'
import { deleteImage } from '../image/index.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const { db, user } = ctx.state
    const { id: userId } = user

    const name = (await req.formData()).get('name') as string
    const { id } = db.queryEntries<{ id: number }>(
      'INSERT INTO albums (name, userId) VALUES (?, ?) RETURNING id',
      [name, userId]
    )[0]
    return redirect(`/album/${id}`)
  },

  async DELETE(req, ctx) {
    const { db, user } = ctx.state
    const { id: userId, isAdmin } = user

    const { id, selectedIds }: { id: number; selectedIds?: number[] } =
      await req.json()
    const ids = selectedIds ?? [id]
    const userIds = db.queryEntries<Pick<Album, 'userId'>>(
      `SELECT userId FROM albums WHERE id IN (${ids.join(', ')})`
    )
    if (
      userIds.some(({ userId: albumUserId }) => albumUserId !== userId) &&
      !isAdmin
    ) {
      return redirect('/error?message=No access')
    }

    const jobs = ids.map((id) => deleteAlbum(db, id))
    await Promise.all(jobs)
    return redirect('/')
  },
}

async function deleteAlbum(db: DB, id: number) {
  const imageIds = db.queryEntries<{ id: number }>(
    'SELECT id FROM images WHERE albumId = ?',
    [id]
  )
  const jobs = imageIds.map(({ id }) => deleteImage(db, id))
  await Promise.all(jobs)
  db.query('DELETE FROM albums WHERE id = :id', { id })
}
