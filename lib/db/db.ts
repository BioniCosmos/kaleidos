import { join } from '$std/path/mod.ts'
import { DB } from 'sqlite'
import config from '../../config.ts'
import { SessionRepo } from './session.ts'
import { UserRepo } from './user.ts'

export class Repo {
  db = new DB(join(config.workingDir, 'kaleidos.db'))
  user = new Proxy(new UserRepo(this.db), {
    get(target, property) {
      const f = target[property as keyof UserRepo]
      if (typeof f !== 'function') {
        return f
      }
      return (...params: Parameters<typeof f>) => {
        // @ts-ignore: unknown reason
        const result = f.apply(target, params)
        if (result === null) {
          return null
        }

        const toBool = (user: User) => ({ ...user, isAdmin: !!user.isAdmin })
        if (Array.isArray(result)) {
          return result.map(toBool)
        }
        return toBool(result)
      }
    },
  })
  session = new SessionRepo(this.db)

  constructor() {
    this.db.execute('PRAGMA foreign_keys = ON')
  }
}

export const repo = new Repo()

export type User = {
  id: string
  password: string
  name: string
  isAdmin: boolean
}

export type Session = {
  id: string
  userId: string
  expiryTime: number
}
