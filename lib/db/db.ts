import { join } from '$std/path/mod.ts'
import { DB } from 'sqlite'
import config from '../../config.ts'
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
}

export const repo = new Repo()

export type User = {
  id: string
  password: string
  name: string
  isAdmin: boolean
}
