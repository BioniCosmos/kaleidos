import type { FreshContext } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import { repo, type User } from '@db'
import { DB } from 'sqlite'
import config from '../config.ts'
import {
  createAlbumTable,
  createImageTable,
  createSettingTable,
  createUserTable,
} from '../lib/db.ts'
import { redirect, verifyToken } from '../lib/utils.ts'

export async function handler(req: Request, ctx: FreshContext<State>) {
  if (
    ctx.destination !== 'route' ||
    ctx.route === '/error' ||
    ctx.route.startsWith('/images/')
  ) {
    return ctx.next()
  }

  const isToLoginOrSignup = ctx.route === '/login' || ctx.route === '/signup'
  const isPostUser = ctx.route === '/user' && req.method === 'POST'
  const userId = await verifyToken(req.headers.get('Cookie'))
  const isValid = userId !== null

  /**
   * | `isToLogin` | `isValid` | Behaviour   |
   * | ----------- | --------- | ----------- |
   * | 0           | 0         | to `/login` |
   * | 0           | 1         | -           |
   * | 1           | 0         | -           |
   * | 1           | 1         | to `/`      |
   */
  if (!isPostUser) {
    if (!isToLoginOrSignup && !isValid) {
      return redirect('/login')
    }
    if (isToLoginOrSignup && isValid) {
      return redirect('/')
    }
  }

  ctx.state = new State(userId)
  if (ctx.route.startsWith('/settings') || ctx.route === '/login') {
    ctx.state.refreshUser(userId)
  }
  return ctx.next()
}

export class State {
  static #user: User | undefined
  static #db: DB

  constructor(userId: string | null) {
    if (State.#db === undefined) {
      State.#db = new DB(join(config.workingDir, 'kaleidos.db'))
      State.#db.execute('PRAGMA foreign_keys = ON')
      createUserTable(State.#db)
      createAlbumTable(State.#db)
      createImageTable(State.#db)
      createSettingTable(State.#db)
    }
    if (userId !== null && State.#user === undefined) {
      this.refreshUser(userId)
    }
  }

  get user() {
    return State.#user!
  }

  get db() {
    return State.#db
  }

  refreshUser(userId: string | null) {
    if (userId !== null) {
      const user = repo.user.findUnique({ where: { id: userId } })
      State.#user = user!
    } else {
      State.#user = undefined
    }
  }
}
