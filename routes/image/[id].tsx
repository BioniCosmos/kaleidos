import { defineRoute } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import { db, Image } from '../../db.ts'

export default defineRoute((_req, ctx) => {
  const { id } = ctx.params
  const image = db
    .queryEntries<Image>('SELECT * FROM images WHERE id = :id', {
      id,
    })
    .at(0)
  if (image === undefined) {
    return ctx.renderNotFound()
  }
  return (
    <>
      <img src={join('/images', image.path)} />
      <h2>{image.name}</h2>
      <ul>
        <li>Date: {new Date(image.date).toLocaleString()}</li>
        <li>Album: {image.albumId}</li>
        <li>User: {image.userId}</li>
      </ul>
    </>
  )
})
