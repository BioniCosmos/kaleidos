import { defineRoute } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import { db, type Album, type Image } from '../../db.ts'

export default defineRoute((_req, ctx) => {
  const album = db
    .queryEntries<Album>('SELECT * FROM albums where id = :id', ctx.params)
    .at(0)
  if (album === undefined) {
    return ctx.renderNotFound()
  }

  const images = db.queryEntries<Image>(
    'SELECT * FROM images where albumId = ?',
    [album.id]
  )

  return (
    <>
      <h2>{album.name}</h2>
      <div>{images.length} image(s)</div>
      <div>
        {images.map((image) => (
          <a href={`/image/${image.id}`}>
            <img src={join('/images', image.path)} />
          </a>
        ))}
      </div>
    </>
  )
})
