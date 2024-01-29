import { defineRoute } from '$fresh/server.ts'
import { db, type Album, type User } from '../db.ts'
import Albums from '../islands/Albums.tsx'
import type { State } from './_middleware.tsx'

export default defineRoute<State>((_req, ctx) => {
  const { userId: id } = ctx.state
  const user = db
    .queryEntries<User>('SELECT * FROM users WHERE id = :id', { id })
    .at(0)
  if (user === undefined) {
    return ctx.renderNotFound()
  }

  const albums = db.queryEntries<Album>(
    'SELECT * FROM albums WHERE userId = ?',
    [user.id]
  )

  return <Albums albums={albums} />
})
