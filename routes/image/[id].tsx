import { defineRoute, type Handlers } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import type { FeatherIconNames } from 'feather-icons'
import Icon from '../../components/Icon.tsx'
import { db, getAlbumOptions, type Album, type Image } from '../../db.ts'
import ImageInfo from '../../islands/ImageInfo.tsx'
import ImageLink from '../../islands/ImageLink.tsx'
import { redirect } from '../../utils.ts'
import type { State } from '../_middleware.tsx'

export const handler: Handlers = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const albumId = Number(formData.get('albumId') as string)
    const { id } = ctx.params

    db.query(
      'UPDATE images SET name = :name, albumId = :albumId WHERE id = :id',
      { name, albumId, id }
    )
    return redirect(req.url)
  },
}

export default defineRoute<State>((_req, ctx) => {
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
  const { name: userName, id: userId } = ctx.state.user

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
      <div class="mb-6 flex items-center flex-col gap-4">
        <h2 class="text-2xl font-bold">{image.name}</h2>
        <ImageInfo image={image} options={getAlbumOptions(userId)} />
      </div>
      <a href={rawPath}>
        <img src={rawPath} class="max-h-[75vh] mx-auto" />
      </a>
      <div class="space-y-4 text-sm mt-6">
        <ul class="space-y-3 text-gray-700">
          {info.map(({ icon, value }) => (
            <li class="flex gap-3">
              {icon}
              <div class="text-gray-500">{value}</div>
            </li>
          ))}
        </ul>
        <hr />
        <ImageLink path={rawPath} name={image.name} />
      </div>
    </>
  )
})
