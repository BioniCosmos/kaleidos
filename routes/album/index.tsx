import type { Handlers } from '$fresh/server.ts'
import { db } from '../../db.ts'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.tsx'

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
}
