import type { Handlers } from '$fresh/server.ts'
import { repo } from '@db'
import { TRPCError } from '@trpc/server'
import { hash } from 'argon2'
import { SqliteError } from 'sqlite'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { Session } from '../../lib/Session.ts'
import { getSettings } from '../../lib/db.ts'
import { t } from '../../lib/trpc/trpc.ts'
import type { State } from '../_middleware.ts'

const strToBool = (val: unknown) => {
  if (val === 'true') {
    return true
  }
  if (val === 'false') {
    return false
  }
  return val
}

const createSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(1).transform(hash),
  name: z.string().default(''),
  isAdmin: z.preprocess(strToBool, z.boolean().optional()),
})

const updateSchema = z.object({
  id: z.string(),
  password: z.string().min(1).transform(hash).optional(),
  name: z.string().optional(),
  isAdmin: z.preprocess(strToBool, z.boolean().optional()),
})

export const userCreateProcedure = t.procedure
  .input(createSchema)
  .mutation(({ ctx, input }) => {
    const { user, db } = ctx.state
    if (user?.isAdmin !== true && getSettings(db).signup === 'disable') {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Signup disabled' })
    }
    if (user?.isAdmin !== true && input.isAdmin === true) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Unauthorized' })
    }
    try {
      repo.user.create({ data: input })
    } catch (error) {
      if (
        error instanceof SqliteError &&
        error.message.startsWith('UNIQUE constraint failed')
      ) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Id exists' })
      }
      throw error
    }
  })

export const handler: Handlers<unknown, State> = {
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

    repo.db.transaction(() => {
      repo.user.update({ where: { id: updateUser.id }, data: updateUser })
      if (updateUser.password !== undefined) {
        Session.revokeByUserId(updateUser.id)
      }
    })
    return new Response(null, { status: 204 })
  },

  async DELETE(req, ctx) {
    const id = await req
      .formData()
      .then((formData) => formData.get('id') as string)
    const { user } = ctx.state
    if (!user.isAdmin && id !== user.id) {
      return new Response('Unauthorized', { status: 403 })
    }

    try {
      return repo.db.transaction(() => {
        Session.revokeByUserId(id)
        const user = repo.user.delete({ where: { id } })
        if (user === null) {
          return ctx.renderNotFound()
        }
        return new Response(null, { status: 204 })
      })
    } catch (error) {
      if (
        error instanceof SqliteError &&
        error.message === 'FOREIGN KEY constraint failed'
      ) {
        return new Response('User should be empty', { status: 400 })
      }
      throw error
    }
  },
}
