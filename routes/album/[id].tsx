import { defineRoute } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import Pagination from '../../components/Pagination.tsx'
import { db, type Album, type Image } from '../../db.ts'
import Upload from '../../islands/UploadImage.tsx'

export default defineRoute((_req, ctx) => {
  const album = db
    .queryEntries<Album>('SELECT * FROM albums where id = :id', ctx.params)
    .at(0)
  if (album === undefined) {
    return ctx.renderNotFound()
  }

  const count = db.query('SELECT count(*) FROM images where albumId = ?', [
    album.id,
  ])[0][0] as number
  const page = Number(ctx.url.searchParams.get('page') ?? '1')
  const totalPages = Math.ceil(count / 15)
  if (page < 1 || page > totalPages) {
    return ctx.renderNotFound()
  }

  const images = db.queryEntries<Image>(
    'SELECT * FROM images where albumId = ? LIMIT 15 OFFSET ?',
    [album.id, (page - 1) * 15]
  )

  return (
    <>
      <div class="mb-6 flex items-center flex-col gap-1">
        <h2 class="text-2xl font-bold">{album.name}</h2>
        <div class="text-gray-500">
          {count} image{count > 1 && 's'}
        </div>
      </div>
      <Upload albumId={album.id!} />
      <div class="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-4">
        {images.map((image) => (
          <a href={`/image/${image.id}`}>
            <img
              src={join('/images', image.path)}
              loading="lazy"
              class="w-full h-48 object-cover hover:scale-105 transition rounded shadow hover:shadow-lg"
            />
          </a>
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={ctx.url.pathname}
      />
    </>
  )
})
