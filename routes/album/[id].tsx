import { defineRoute } from '$fresh/server.ts'
import Pagination from '../../components/Pagination.tsx'
import { db, type Album, type Image } from '../../db.ts'
import Images from '../../islands/Images.tsx'

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
  if ((page < 1 || page > totalPages) && totalPages !== 0) {
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
      <Images images={images} albumId={album.id!} />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={ctx.url.pathname}
      />
    </>
  )
})
