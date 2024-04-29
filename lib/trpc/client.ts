import { IS_BROWSER } from '$fresh/runtime.ts'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { AppRouter } from './server.ts'

export const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: `${IS_BROWSER ? location.origin : ''}/trpc` })],
})
