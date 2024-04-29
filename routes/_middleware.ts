import type { FreshContext } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import { type User } from '@db'
import { DB } from 'sqlite'
import config from '../config.ts'
import { Session } from '../lib/Session.ts'
import {
  createAlbumTable,
  createImageTable,
  createSettingTable,
  createUserTable,
} from '../lib/db.ts'
import { redirect } from '../lib/utils.ts'

export function handler(req: Request, ctx: FreshContext<State>) {
  if (
    ctx.destination !== 'route' ||
    ctx.route === '/error' ||
    ctx.route.startsWith('/images/')
  ) {
    return ctx.next()
  }

  const isToLoginOrSignup = ctx.route === '/login' || ctx.route === '/signup'
  const isPostUser = ctx.url.pathname === '/trpc/user.create'
  const user = Session.verify(req.headers.get('Cookie'))
  const isValid = !!user

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

  ctx.state = new State(user)
  if (ctx.state.user === null && !isToLoginOrSignup && !isPostUser) {
    return redirect('/login')
  }
  return ctx.next()
}

export class State {
  #user: User | null
  static #db: DB

  constructor(user: User | false) {
    if (State.#db === undefined) {
      State.#db = new DB(join(config.workingDir, 'kaleidos.db'))
      State.#db.execute('PRAGMA foreign_keys = ON')
      createUserTable(State.#db)
      createAlbumTable(State.#db)
      createImageTable(State.#db)
      createSettingTable(State.#db)
    }
    this.#user = user ? user : null
  }

  get user() {
    return this.#user!
  }

  get db() {
    return State.#db
  }
}
