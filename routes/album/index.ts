import type { Handlers } from '$fresh/server.ts'
import type { Album } from '../../db.ts'
import { db } from '../../db.ts'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.ts'
import { deleteImage } from '../image/index.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const { id: userId } = ctx.state.user
    const name = (await req.formData()).get('name') as string
    const { id } = db.queryEntries<{ id: number }>(
      'INSERT INTO albums (name, userId) VALUES (?, ?) RETURNING id',
      [name, userId]
    )[0]
    return redirect(`/album/${id}`)
  },

  async DELETE(req, ctx) {
    const { id, selectedIds }: { id: number; selectedIds?: number[] } =
      await req.json()
    const ids = selectedIds ?? [id]
    const userIds = db.queryEntries<Pick<Album, 'userId'>>(
      `SELECT userId FROM albums WHERE id IN (${ids.join(', ')})`
    )
    const { id: userId, isAdmin } = ctx.state.user
    if (
      userIds.some(({ userId: albumUserId }) => albumUserId !== userId) &&
      !isAdmin
    ) {
      return redirect('/error?message=No access')
    }

    const jobs = ids.map((id) => deleteAlbum(id))
    await Promise.all(jobs)
    return redirect('/')
  },
}

async function deleteAlbum(id: number) {
  const imageIds = db.queryEntries<{ id: number }>(
    'SELECT id FROM images WHERE albumId = ?',
    [id]
  )
  const jobs = imageIds.map(({ id }) => deleteImage(id))
  await Promise.all(jobs)
  db.query('DELETE FROM albums WHERE id = :id', { id })
}
