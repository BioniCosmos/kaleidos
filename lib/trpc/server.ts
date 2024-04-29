import { userCreateProcedure } from '../../routes/user/index.ts'
import { t } from './trpc.ts'

export const appRouter = t.router({
  user: t.router({
    create: userCreateProcedure,
  }),
})

export type AppRouter = typeof appRouter
