import type { DB } from 'sqlite'
import type { Session } from './db.ts'

export class SessionRepo {
  #db: DB

  constructor(db: DB) {
    db.execute(`CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT NOT NULL REFERENCES users,
      expiryTime INTEGER NOT NULL
    )`)
    this.#db = db
  }

  findUnique({ where }: { where: SessionWhereUniqueInput }) {
    return (
      this.#db
        .queryEntries<Session>('SELECT * FROM session WHERE id = :id', where)
        .at(0) ?? null
    )
  }

  create({ data }: { data: Session }) {
    return (
      this.#db
        .queryEntries<Session>(
          `INSERT INTO session VALUES (:id, :userId, :expiryTime) RETURNING *`,
          data
        )
        .at(0) ?? null
    )
  }

  delete({ where }: { where: SessionWhereUniqueInput }) {
    return (
      this.#db
        .queryEntries<Session>(
          'DELETE FROM session WHERE id = :id RETURNING *',
          where
        )
        .at(0) ?? null
    )
  }

  deleteMany({ where }: { where: Partial<Session> }) {
    const ids = this.#db.queryEntries<Session>(
      'DELETE FROM session WHERE userId = :userId RETURNING id',
      where
    )
    return { count: ids.length }
  }
}

export type SessionWhereUniqueInput = Pick<Session, 'id'>
