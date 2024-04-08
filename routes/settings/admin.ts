import type { Handlers } from '$fresh/server.ts'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const { user, db } = ctx.state
    if (!user.isAdmin) {
      return redirect('/error?message=No access')
    }

    const formData = await req.formData()
    ;[...formData.entries()].forEach(([key, value]) =>
      db.query('UPDATE settings SET value = ? WHERE key = ?', [
        value as string,
        key,
      ])
    )
    return redirect('/settings')
  },
}
