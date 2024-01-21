import type { FreshContext } from '$fresh/server.ts'
import { redirect, verifyToken } from '../utils.ts'

export interface State {
  userId: string
}

export async function handler(req: Request, ctx: FreshContext<State>) {
  if (
    ctx.destination !== 'route' ||
    ctx.route === '/error' ||
    ctx.route.startsWith('/images/')
  ) {
    return ctx.next()
  }

  const isToLogin = ctx.route === '/login'
  const userId = await verifyToken(req.headers.get('Cookie'))
  const isValid = userId !== null

  if (!isToLogin && !isValid) {
    return redirect('/login')
  }
  if (isToLogin && isValid) {
    return redirect('/')
  }

  if (isValid) {
    ctx.state = { userId }
  }
  return ctx.next()
}
