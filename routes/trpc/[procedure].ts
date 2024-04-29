import type { Handler } from '$fresh/server.ts'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '../../lib/trpc/server.ts'
import { createContext } from '../../lib/trpc/trpc.ts'
import type { State } from '../_middleware.ts'

export const handler: Handler<unknown, State> = (req, ctx) => {
  return fetchRequestHandler({
    endpoint: '/trpc',
    req,
    router: appRouter,
    createContext: createContext(ctx.state),
  })
}
