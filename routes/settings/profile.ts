import type { Handlers } from '$fresh/server.ts'
import { redirect } from '../../lib/utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const name = (await req.formData()).get('name') as string

    const { db, user } = ctx.state
    const { id } = user

    db.query('UPDATE users SET name = :name WHERE id = :id', { name, id })
    return redirect('/settings')
  },
}
