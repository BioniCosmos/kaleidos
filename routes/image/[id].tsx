import { defineRoute, type Handlers } from '$fresh/server.ts'
import { basename, dirname, extname, join } from '$std/path/mod.ts'
import Icon from '../../components/Icon.tsx'
import { db, type Album, type Image, type User } from '../../db.ts'
import DeleteImage from '../../islands/DeleteImage.tsx'
import { redirect } from '../../utils.ts'

export const handler: Handlers = {
  POST(_req, ctx) {
    const { id } = ctx.params
    const albumId = db.transaction(() => {
      const { albumId, path } = db.queryEntries<
        Pick<Image, 'albumId' | 'path'>
      >('DELETE FROM images WHERE id = :id RETURNING albumId, path', { id })[0]

      const rawPath = join(Deno.cwd(), 'images/raw/', path)
      Deno.removeSync(rawPath)

      const tmpPath = join(Deno.cwd(), 'images/tmp/', path)
      Array.from(Deno.readDirSync(dirname(tmpPath)))
        .filter(({ name }) => name.startsWith(basename(path)))
        .forEach(({ name }) => Deno.removeSync(tmpPath + extname(name)))

      return albumId
    })
    return redirect(`/album/${albumId}`)
  },
}

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
  const userName = db.queryEntries<Pick<User, 'name'>>(
    'SELECT name from users where id = ?',
    [image.userId]
  )[0].name

  const info = [
    [
      <Icon name="calendar" options={{ width: 20, height: 20 }} />,
      new Date(image.date).toLocaleString(),
    ],
    [<Icon name="folder" options={{ width: 20, height: 20 }} />, albumName],
    [<Icon name="user" options={{ width: 20, height: 20 }} />, userName],
  ]

  return (
    <>
      <div class="mb-6 flex items-center flex-col gap-1">
        <h2 class="text-2xl font-bold">{image.name}</h2>
      </div>
      <a href={join('/images', image.path)}>
        <img src={join('/images', image.path)} class="max-h-[75vh] mx-auto" />
      </a>
      <ul class="space-y-3 mt-6 text-sm text-gray-700">
        {info.map((item) => (
          <li class="flex gap-3">
            {item[0]}
            <div class="text-gray-500">{item[1]}</div>
          </li>
        ))}
      </ul>
      <DeleteImage />
    </>
  )
})
