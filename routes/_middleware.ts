import type { FreshContext } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import { DB } from 'sqlite'
import config from '../config.ts'
import type { User } from '../db.ts'
import {
  createAlbumTable,
  createImageTable,
  createSettingTable,
  createUserTable,
} from '../db.ts'
import { redirect, verifyToken } from '../utils.ts'

export async function handler(req: Request, ctx: FreshContext<State>) {
  if (
    ctx.destination !== 'route' ||
    ctx.route === '/error' ||
    ctx.route.startsWith('/images/')
  ) {
    return ctx.next()
  }

  const isToLoginOrSignup = ctx.route === '/login' || ctx.route === '/signup'
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
  if (!isToLoginOrSignup && !isValid) {
    return redirect('/login')
  }
  if (isToLoginOrSignup && isValid) {
    return redirect('/')
  }

  ctx.state = new State(userId, true)
  if (ctx.route.startsWith('/settings') || ctx.route === '/login') {
    ctx.state.refreshUser(userId)
  }
  return ctx.next()
}

export class State {
  static #user: User | undefined
  static #db: DB

  constructor(userId: string | null, userInit: boolean) {
    if (State.#db === undefined) {
      State.#db = new DB(join(config.workingDir, 'kaleidos.db'))
      State.#db.execute('PRAGMA foreign_keys = ON')
      createUserTable(State.#db)
      createAlbumTable(State.#db)
      createImageTable(State.#db)
      createSettingTable(State.#db)

      if (userInit) {
        const defaultPassword = hash('123456')
        State.#db.query(
          `INSERT OR IGNORE INTO users VALUES('admin', ?, '', TRUE)`,
          [defaultPassword]
        )
      }
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
      const [user] = State.#db.queryEntries<User>(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      )
      user.isAdmin = (user.isAdmin as unknown as number) === 1
      State.#user = user
    } else {
      State.#user = undefined
    }
  }
}
