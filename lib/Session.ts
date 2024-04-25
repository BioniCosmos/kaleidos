import { repo } from '@db'
import 'https://esm.sh/temporal-polyfill@0.2.4/global'

export class Session {
  id = crypto.randomUUID()
  userId: string
  expiryTime = Temporal.Now.instant().add({ hours: 24 * 15 }).epochSeconds

  constructor(userId: string) {
    this.userId = userId
  }

  static add(userId: string): ['Set-Cookie', string] {
    const session = new Session(userId)
    repo.session.create({ data: session })
    return [
      'Set-Cookie',
      `token=${session.id}; Max-Age=${Temporal.Duration.from({
        days: 15,
      }).total({ unit: 'second' })}`,
    ]
  }

  static verify(cookie: string | null) {
    const id = Session.#getToken(cookie)
    if (id === undefined || id === null) {
      return false
    }

    const session = repo.session.findUnique({ where: { id } })
    if (
      session === null ||
      Temporal.Instant.compare(
        Temporal.Instant.fromEpochSeconds(session.expiryTime),
        Temporal.Now.instant()
      ) !== 1
    ) {
      return false
    }

    return repo.user.findUnique({ where: { id: session.userId } }) ?? false
  }

  static revokeByCookie(cookie: string | null) {
    const id = Session.#getToken(cookie)
    if (id === undefined) {
      return false
    }
    return Session.revokeById(id)
  }

  static revokeById(id: string) {
    return repo.session.delete({ where: { id } }) !== null
  }

  static revokeByUserId(userId: string) {
    return repo.session.deleteMany({ where: { userId } }).count !== 0
  }

  static #getToken(cookie: string | null) {
    return cookie
      ?.split('; ')
      .map((item) => item.split('='))
      .find(([key]) => key === 'token')
      ?.at(1)
  }
}
