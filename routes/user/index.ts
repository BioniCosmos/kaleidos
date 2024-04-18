import type { Handlers } from '$fresh/server.ts'
import { hash } from 'argon2'
import { getSettings, type User } from '../../lib/db.ts'
import { redirect } from '../../lib/utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const { user, db } = ctx.state
    const userIsAdmin = user?.isAdmin ?? false

    if (!userIsAdmin && getSettings(db).signup === 'disable') {
      return redirect('/error?message=Signup disabled')
    }

    const newUser = await req
      .formData()
      .then(
        (formData) => Object.fromEntries(formData.entries()) as unknown as User
      )
      .then(({ id, password, name, isAdmin }) => ({
        id,
        password: hash(password),
        name: name ?? '',
        isAdmin: userIsAdmin && isAdmin,
      }))

    const users = db.queryEntries<User>('SELECT * FROM users WHERE id = ?', [
      newUser.id,
    ])
    if (users.length !== 0) {
      return redirect('/error?message=Id exists')
    }

    db.queryEntries(
      `INSERT INTO users VALUES (:id, :password, :name, :isAdmin)`,
      newUser
    )
    return redirect(userIsAdmin ? '/settings' : '/login')
  },
  async PUT(req, ctx) {},
  async DELETE(req, ctx) {},
}
