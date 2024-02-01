import type { FreshContext } from '$fresh/server.ts'
import type { User } from '../db.ts'
import { db } from '../db.ts'
import { redirect, verifyToken } from '../utils.ts'

export interface State {
  user: User
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
    const [user] = db.queryEntries<User>('SELECT * FROM users WHERE id = ?', [
      userId,
    ])
    ctx.state = {
      user,
    }
  }
  return ctx.next()
}
