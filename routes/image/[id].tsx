import { defineRoute, type Handlers } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import Icon from '../../components/Icon.tsx'
import { db, type Album, type Image, type User } from '../../db.ts'
import { redirect } from '../../utils.ts'

export const handler: Handlers = {
  POST(_req, ctx) {
    const { id } = ctx.params
    const { albumId } = db.queryEntries<Pick<Image, 'albumId'>>(
      'DELETE FROM images WHERE id = :id RETURNING albumId',
      { id }
    )[0]
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
      <form method="post">
        <button class="py-2 px-4 flex gap-3 items-center fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-red-500 text-white font-bold rounded-full hover:bg-red-700 transition">
          <Icon
            name="trash"
            options={{ width: 18, height: 18, 'stroke-width': 3 }}
          />
          <div>Delete</div>
        </button>
      </form>
    </>
  )
})
