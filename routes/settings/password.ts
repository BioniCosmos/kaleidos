import type { Handlers } from '$fresh/server.ts'
import { repo } from '@db'
import { hash, verify } from 'argon2'
import { Session } from '../../lib/Session.ts'
import { redirect } from '../../lib/utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const currentPassword = formData.get('currentPassword') as string

    const { user } = ctx.state
    const { id, password } = user

    if (!verify(currentPassword, password)) {
      return redirect('/error?message=Wrong password')
    }

    const newPassword = formData.get('newPassword')
    const confirmPassword = formData.get('confirmPassword')
    if (newPassword !== confirmPassword) {
      return redirect('/error?message=Passwords not match')
    }

    const hashedPassword = hash(newPassword as string)
    repo.db.transaction(() => {
      repo.user.update({ where: { id }, data: { password: hashedPassword } })
      Session.revokeByUserId(user.id)
    })
    return redirect('/settings')
  },
}
