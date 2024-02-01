import type { Handlers } from '$fresh/server.ts'
import { db } from '../../db.ts'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.tsx'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const name = (await req.formData()).get('name') as string
    const { id } = ctx.state.user
    db.query('UPDATE users SET name = :name WHERE id = :id', { name, id })
    return redirect('/settings')
  },
}
