import type { Handlers } from '$fresh/server.ts'
import { hash, verify } from 'argon2'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const currentPassword = formData.get('currentPassword') as string

    const { db, user } = ctx.state
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
    db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id])
    return redirect('/settings')
  },
}
