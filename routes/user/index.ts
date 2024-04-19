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

  async PUT(req, ctx) {
    const { user, db } = ctx.state
    const { id, isAdmin: userIsAdmin } = user
    const updatedUser = await req
      .formData()
      .then((formData) => formData.entries())
      .then(Object.fromEntries)
      .then(({ password, isAdmin, ...user }: User) => ({
        ...user,
        password: hash(password),
        isAdmin: userIsAdmin && isAdmin,
      }))

    if (!userIsAdmin && updatedUser.id !== id) {
      return new Response('No access', { status: 403 })
    }

    db.query(
      `UPDATE users SET name = :name, isAdmin = :isAdmin${
        updatedUser.password !== undefined ? ', password = :password' : ''
      } WHERE id = :id`,
      updatedUser
    )
    return new Response(null, { status: 204 })
  },
  async DELETE(req, ctx) {},
}
