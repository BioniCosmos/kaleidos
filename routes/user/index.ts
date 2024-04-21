import type { Handlers } from '$fresh/server.ts'
import { repo, type User } from '@db'
import { hash } from 'argon2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { fromZodError } from 'https://esm.sh/zod-validation-error@3.1.0'
import { getSettings } from '../../lib/db.ts'
import { redirect } from '../../lib/utils.ts'
import type { State } from '../_middleware.ts'

const updateSchema = z.object({
  id: z.string(),
  password: z.string().transform(hash).optional(),
  name: z.string().optional(),
  isAdmin: z.preprocess((val) => {
    if (val === 'true') {
      return true
    }
    if (val === 'false') {
      return false
    }
    return val
  }, z.boolean().optional()),
})

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
    const { user } = ctx.state
    const { id, isAdmin } = user
    const fields = await req
      .formData()
      .then((formData) => Object.fromEntries(formData.entries()))
    const parseResult = updateSchema.safeParse(fields)
    if (!parseResult.success) {
      return new Response(fromZodError(parseResult.error).message, {
        status: 400,
      })
    }

    const { data: updateUser } = parseResult
    if (
      !isAdmin &&
      (updateUser.id !== id ||
        updateUser.password !== undefined ||
        updateUser.isAdmin === true)
    ) {
      return new Response('Unauthorized', { status: 403 })
    }

    repo.user.update({ where: { id: updateUser.id }, data: updateUser })
    return new Response(null, { status: 204 })
  },
  async DELETE(req, ctx) {},
}
