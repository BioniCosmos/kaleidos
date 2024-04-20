import type { DB } from 'sqlite'
import type { User } from './db.ts'

export class UserRepo {
  #db: DB

  constructor(db: DB) {
    this.#db = db
  }

  findUnique({ where }: { where: Pick<User, 'id'> }) {
    return (
      this.#db
        .queryEntries<User>('SELECT * FROM users WHERE id = :id', where)
        .at(0) ?? null
    )
  }

  findMany() {
    return this.#db.queryEntries<User>('SELECT * FROM users')
  }

  create({
    data,
  }: {
    data: Omit<User, 'isAdmin'> & { isAdmin?: User['isAdmin'] }
  }) {
    return (
      this.#db
        .queryEntries<User>(
          `INSERT INTO users VALUES (:id, :password, :name, :isAdmin) RETURNING *`,
          data.isAdmin !== undefined ? data : { ...data, isAdmin: false }
        )
        .at(0) ?? null
    )
  }

  update({
    where,
    data,
  }: {
    where: Pick<User, 'id'>
    data: Partial<Omit<User, 'id'>>
  }) {
    const set = Object.entries(data)
      .reduce(
        (acc, [key, value]) =>
          value !== undefined ? [...acc, `${key} = :${key}`] : acc,
        Array.of()
      )
      .join(', ')
    if (set === '') {
      return null
    }
    return (
      this.#db
        .queryEntries<User>(
          `UPDATE users SET ${set} WHERE id = :id RETURNING *`,
          { ...data, ...where }
        )
        .at(0) ?? null
    )
  }
}
