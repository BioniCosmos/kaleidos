import { defineRoute } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import { Album, db, Image } from '../../db.ts'

export default defineRoute((req, ctx) => {
  const { id } = ctx.params
  const album = db
    .queryEntries<Album>('SELECT * FROM albums where id = ?', [id])
    .at(0)
  if (album === undefined) {
    return ctx.renderNotFound()
  }

  const images = db.queryEntries<Image>(
    'SELECT * FROM images where albumId = ?',
    [id]
  )

  return (
    <>
      <h2>{album.name}</h2>
      <div>{images.length} image(s)</div>
      <div>
        {images.map((image) => (
          <img src={join('/images', image.path)} />
        ))}
      </div>
    </>
  )
})
