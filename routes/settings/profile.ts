import type { Handlers } from '$fresh/server.ts'
import { repo } from '@db'
import { redirect } from '../../lib/utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const name = (await req.formData()).get('name') as string

    const { user } = ctx.state
    const { id } = user

    repo.user.update({ where: { id }, data: { name } })
    return redirect('/settings')
  },
}
