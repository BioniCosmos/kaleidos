import { defineRoute, type Handlers } from '$fresh/server.ts'
import Pagination from '../../components/Pagination.tsx'
import Title from '../../components/Title.tsx'
import { getAlbumOptions, type Album, type Image } from '../../db.ts'
import AlbumInfo from '../../islands/AlbumInfo.tsx'
import Images from '../../islands/Images.tsx'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const name = (await req.formData()).get('name') as string
    const { id } = ctx.params

    const { db, user } = ctx.state
    const { id: userId, isAdmin } = user

    const [{ userId: albumUserId }] = db.queryEntries<Pick<Album, 'userId'>>(
      'SELECT userId FROM albums WHERE id = :id',
      { id }
    )
    if (albumUserId !== userId && !isAdmin) {
      return redirect('/error?message=No access')
    }

    db.query('UPDATE albums SET name = :name WHERE id = :id', { name, id })
    return redirect(req.url)
  },
}

export default defineRoute<State>((_req, ctx) => {
  const { db, user } = ctx.state
  const { id: userId, isAdmin } = user

  const album = db
    .queryEntries<Album>('SELECT * FROM albums WHERE id = :id', ctx.params)
    .at(0)
  if (album === undefined) {
    return ctx.renderNotFound()
  }

  if (album.userId !== userId && !isAdmin) {
    return redirect('/error?message=No access')
  }

  const count = db.query('SELECT count(*) FROM images WHERE albumId = ?', [
    album.id,
  ])[0][0] as number
  const page = Number(ctx.url.searchParams.get('page') ?? '1')
  const totalPages = Math.ceil(count / 15)
  if ((page < 1 || page > totalPages) && totalPages !== 0) {
    return ctx.renderNotFound()
  }

  const images = db.queryEntries<Image>(
    'SELECT * FROM images WHERE albumId = ? LIMIT 15 OFFSET ?',
    [album.id, (page - 1) * 15]
  )

  return (
    <>
      <Title>{album.name}</Title>
      <div class="mb-6 flex items-center flex-col gap-4">
        <h2 class="text-2xl font-bold dark:text-zinc-50">{album.name}</h2>
        <AlbumInfo album={album} count={count} />
      </div>
      <Images
        images={images}
        albumId={album.id}
        options={getAlbumOptions(db, userId, isAdmin)}
      />
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        basePath={ctx.url.pathname}
      />
    </>
  )
})
