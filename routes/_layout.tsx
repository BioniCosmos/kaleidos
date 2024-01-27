import { defineLayout } from '$fresh/server.ts'
import { db, type User } from '../db.ts'
import type { State } from './_middleware.tsx'

export default defineLayout<State>((_req, ctx) => {
  const { userId: id } = ctx.state
  const user = db
    .queryEntries<User>('SELECT * FROM users WHERE id = :id', { id })
    .at(0)
  if (user === undefined) {
    return <ctx.Component />
    // return ctx.renderNotFound()
  }

  return (
    <>
      <header class="bg-gray-300 px-4 py-2 flex items-center justify-between">
        <a href="/" class="text-xl font-bold">
          Kalaidos
        </a>
        <div class="text-right">
          <h2 class="text-xl font-bold">{user.name}</h2>
          <h3 class="text-gray-500">{user.id}</h3>
        </div>
      </header>
      <main class="p-4 pt-6">
        <ctx.Component />
      </main>
    </>
  )
})
