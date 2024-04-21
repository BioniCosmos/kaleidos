import { defineRoute, type Handlers } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import type { User } from '@db'
import type { FeatherIconNames } from 'feather-icons'
import Icon from '../../components/Icon.tsx'
import Title from '../../components/Title.tsx'
import ImageInfo from '../../islands/ImageInfo.tsx'
import ImageLink from '../../islands/ImageLink.tsx'
import {
  authorizeAlbumOwner,
  authorizeImageOwner,
  getAlbumOptions,
  type Album,
  type Image,
} from '../../lib/db.ts'
import { redirect } from '../../lib/utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const albumId = Number(formData.get('albumId') as string)
    const { id } = ctx.params
    const imageId = Number(id)

    const { db, user } = ctx.state
    const { id: userId, isAdmin } = user

    if (
      !authorizeImageOwner(db, [imageId], userId, isAdmin) ||
      !authorizeAlbumOwner(db, albumId, userId, isAdmin)
    ) {
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
    .queryEntries<
      Image & {
        albumName: Album['name']
        userName: User['name']
        userId: User['id']
      }
    >(
      `
      SELECT 
        images.*,
        albums.name albumName,
        users.name  userName,
        users.id    userId
      FROM images
      JOIN albums ON albumId = albums.id
      JOIN users ON userId = users.id
      WHERE images.id = :id
      `,
      ctx.params
    )
    .at(0)
  if (image === undefined) {
    return ctx.renderNotFound()
  }

  if (image.userId !== userId && !isAdmin) {
    return redirect('/error?message=No access')
  }

  const info = (
    [
      ['calendar', new Date(image.date).toLocaleString()],
      ['folder', image.albumName],
      ['user', image.userName !== '' ? image.userName : image.userId],
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
        <h2 class="text-2xl font-bold dark:text-zinc-50">{image.name}</h2>
        <ImageInfo
          image={image}
          options={getAlbumOptions(db, userId, isAdmin)}
        />
      </div>
      <a href={rawPath}>
        <img
          src={rawPath}
          class="max-h-[75vh] mx-auto w-auto"
          width={image.width}
          height={image.height}
        />
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
