import type { FreshContext } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import { DB } from 'sqlite'
import config from '../config.ts'
import type { User } from '../db.ts'
import { createAlbumTable, createImageTable, createUserTable } from '../db.ts'
import { redirect, verifyToken } from '../utils.ts'

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

  // | `isToLogin` | `isValid` | Behaviour   |
  // | ----------- | --------- | ----------- |
  // | 0           | 0         | to `/login` |
  // | 0           | 1         | -           |
  // | 1           | 0         | -           |
  // | 1           | 1         | to `/`      |
  if (!isToLogin && !isValid) {
    return redirect('/login')
  }
  if (isToLogin && isValid) {
    return redirect('/')
  }

  ctx.state = new State(isValid, userId)
  if (ctx.route.startsWith('/settings')) {
    ctx.state.refreshUser(userId)
  }
  return ctx.next()
}

export class State {
  static #user: User
  static #db: DB

  constructor(isValid: boolean, userId: string | null) {
    if (State.#db === undefined) {
      State.#db = new DB(join(config.workingDir, 'kaleidos.db'))
      State.#db.execute('PRAGMA foreign_keys = ON')
      createUserTable(State.#db)
      createAlbumTable(State.#db)
      createImageTable(State.#db)
    }

    if (isValid && State.#user === undefined) {
      this.refreshUser(userId)
    }
  }

  get user() {
    return State.#user
  }

  get db() {
    return State.#db
  }

  refreshUser(userId: string | null) {
    const [user] = State.#db.queryEntries<User>(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    )
    State.#user = user
  }
}
