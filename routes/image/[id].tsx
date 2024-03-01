import { defineRoute, type Handlers } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import type { FeatherIconNames } from 'feather-icons'
import Icon from '../../components/Icon.tsx'
import Title from '../../components/Title.tsx'
import { getAlbumOptions, type Album, type Image, type User } from '../../db.ts'
import ImageInfo from '../../islands/ImageInfo.tsx'
import ImageLink from '../../islands/ImageLink.tsx'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const albumId = Number(formData.get('albumId') as string)
    const { id } = ctx.params

    const { db, user } = ctx.state
    const { id: userId, isAdmin } = user

    const [{ userId: imageUserId }] = db.queryEntries<Pick<Image, 'userId'>>(
      'SELECT userId FROM images WHERE id = :id',
      { id }
    )
    if (imageUserId !== userId && !isAdmin) {
      return redirect('/error?message=No access')
    }

    const [{ userId: albumUserId }] = db.queryEntries<Pick<Album, 'userId'>>(
      'SELECT userId FROM albums WHERE id = ?',
      [albumId]
    )
    if (albumUserId !== userId && !isAdmin) {
      return redirect('/error?message=No access')
    }

    db.query(
      'UPDATE images SET name = :name, albumId = :albumId WHERE id = :id',
      { name, albumId, id }
    )
    return redirect(req.url)
  },
}

export default defineRoute<State>((_req, ctx) => {
  const { db, user } = ctx.state
  const { id: userId, isAdmin } = user

  const image = db
    .queryEntries<Image>('SELECT * FROM images WHERE id = :id', ctx.params)
    .at(0)
  if (image === undefined) {
    return ctx.renderNotFound()
  }

  if (image.userId !== userId && !isAdmin) {
    return redirect('/error?message=No access')
  }

  const albumName = db.queryEntries<Pick<Album, 'name'>>(
    'SELECT name FROM albums WHERE id = ?',
    [image.albumId]
  )[0].name

  const [{ name: userName }] = db.queryEntries<Pick<User, 'name'>>(
    'SELECT name FROM users WHERE id = ?',
    [image.userId]
  )

  const info = (
    [
      ['calendar', new Date(image.date).toLocaleString()],
      ['folder', albumName],
      ['user', userName !== '' ? userName : image.userId],
    ] satisfies [FeatherIconNames, string][]
  ).map(([iconName, value]) => ({
    icon: <Icon name={iconName} options={{ width: 20, height: 20 }} />,
    value,
  }))
  const rawPath = join('/images', image.path)

  return (
    <>
      <Title>{image.name}</Title>
      <div class="mb-6 flex items-center flex-col gap-4">
        <h2 class="text-2xl font-bold text-zinc-50">{image.name}</h2>
        <ImageInfo
          image={image}
          options={getAlbumOptions(db, userId, isAdmin)}
        />
      </div>
      <a href={rawPath}>
        <img src={rawPath} class="max-h-[75vh] mx-auto" />
      </a>
      <div class="space-y-4 text-sm mt-6">
        <ul class="space-y-3 text-gray-700">
          {info.map(({ icon, value }) => (
            <li class="flex gap-3 text-gray-700 dark:text-zinc-50 dark:text-opacity-60">
              {icon}
              <div>{value}</div>
            </li>
          ))}
        </ul>
        <hr />
        <ImageLink path={rawPath} name={image.name} />
      </div>
    </>
  )
})
