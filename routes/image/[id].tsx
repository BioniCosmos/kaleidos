import { defineRoute } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import { Album, Image, db } from '../../db.ts'

export default defineRoute((_req, ctx) => {
  const image = db
    .queryEntries<Image>('SELECT * FROM images WHERE id = :id', ctx.params)
    .at(0)
  if (image === undefined) {
    return ctx.renderNotFound()
  }

  const albumName = db.queryEntries<Pick<Album, 'name'>>(
    'SELECT name from albums where id = ?',
    [image.albumId]
  )[0].name

  return (
    <>
      <a href={join('/images', image.path)}>
        <img src={join('/images', image.path)} />
      </a>
      <h2>{image.name}</h2>
      <ul>
        <li>Date: {new Date(image.date).toLocaleString()}</li>
        <li>Album: {albumName}</li>
        <li>User: {image.userId}</li>
      </ul>
    </>
  )
})
