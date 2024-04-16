import type { Handlers } from '$fresh/server.ts'
import { redirect } from '../lib/utils.ts'

export const handler: Handlers = {
  GET() {
    const res = redirect('/login')
    res.headers.set(
      'Set-Cookie',
      `token=; Expires=${new Date(0).toUTCString()}`
    )
    return res
  },
}
