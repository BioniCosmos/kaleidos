import { defineRoute } from '$fresh/server.ts'
import { db, type Album, type User } from '../../db.ts'

export default defineRoute((_req, ctx) => {
  const user = db
    .queryEntries<User>('SELECT * FROM users WHERE id = :id', ctx.params)
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
      <div>
        <h2>{user.name}</h2>
        <h3>{user.id}</h3>
      </div>
      <div>
        {albums.map((album) => (
          <a href={`/album/${album.id}`}>{album.name}</a>
        ))}
      </div>
    </>
  )
})
