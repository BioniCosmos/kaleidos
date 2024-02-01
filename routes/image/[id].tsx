import { defineRoute } from '$fresh/server.ts'
import { join } from '$std/path/mod.ts'
import FloatingMenu from '../../components/FloatingMenu.tsx'
import Icon from '../../components/Icon.tsx'
import { db, type Album, type Image } from '../../db.ts'
import DeleteSelection from '../../islands/DeleteSelection.tsx'
import type { State } from '../_middleware.tsx'

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
  const { name: userName } = ctx.state.user

  const info = [
    [
      <Icon name="calendar" options={{ width: 20, height: 20 }} />,
      new Date(image.date).toLocaleString(),
    ],
    [<Icon name="folder" options={{ width: 20, height: 20 }} />, albumName],
    [
      <Icon name="user" options={{ width: 20, height: 20 }} />,
      userName !== '' ? userName : image.userId,
    ],
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
      <FloatingMenu>
        <DeleteSelection target="image" id={image.id!} />
      </FloatingMenu>
    </>
  )
})
