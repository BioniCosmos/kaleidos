import type { Handlers } from '$fresh/server.ts'
import { db } from '../../db.ts'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.tsx'
import { deleteImage } from '../image/index.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const { userId } = ctx.state
    const name = (await req.formData()).get('name') as string
    const { id } = db.queryEntries<{ id: number }>(
      'INSERT INTO albums (name, userId) VALUES (?, ?) RETURNING id',
      [name, userId]
    )[0]
    return redirect(`/album/${id}`)
  },

  async DELETE(req) {
    const { id, selectedIds }: { id: number; selectedIds?: number[] } =
      await req.json()
    const ids = selectedIds ?? [id]
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
