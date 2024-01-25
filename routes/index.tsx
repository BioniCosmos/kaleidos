import { defineRoute } from '$fresh/server.ts'
import { db, type Album, type User } from '../db.ts'
import NewAlbum from '../islands/NewAlbum.tsx'
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

  return (
    <>
      <NewAlbum />
      <div class="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-4">
        {albums.map((album) => (
          <a
            href={`/album/${album.id}`}
            class="rounded shadow bg-gray-100 hover:bg-gray-200 p-4 text-xl hover:scale-105 hover:shadow-lg transition"
          >
            {album.name}
          </a>
        ))}
      </div>
    </>
  )
})
