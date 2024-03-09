import type { Handlers } from '$fresh/server.ts'
import { existsSync } from '$std/fs/mod.ts'
import { basename, join } from '$std/path/mod.ts'
import type { DB } from 'sqlite'
import { ImagePath, formats, processImage } from '../../ImagePath.ts'
import { type Album, type Image } from '../../db.ts'
import { getTime, redirect } from '../../utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const imageFiles = formData.getAll('imageFile') as File[]

    const { db, user } = ctx.state
    const { id: userId } = user

    const albumId = Number(formData.get('albumId') as string)
    const jobs = imageFiles.map((imageFile) =>
      saveImage(db, imageFile, userId, albumId)
    )
    await Promise.all(jobs)

    const [[total]] = db.query<[number]>(
      'SELECT count(*) FROM images WHERE albumId = :albumId',
      { albumId }
    )
    const lastPage = Math.ceil(total / 15)
    return redirect(`/album/${albumId}?page=${lastPage}`)
  },

  async DELETE(req, ctx) {
    const { db, user } = ctx.state
    const { id: userId, isAdmin } = user

    const { id, selectedIds }: { id: number; selectedIds?: number[] } =
      await req.json()
    const ids = selectedIds ?? [id]
    const jobs = ids.map((id) => deleteImage(db, id))

    const userIds = db.queryEntries<Pick<Image, 'userId'>>(
      `SELECT userId FROM images WHERE id IN (${ids.join(', ')})`
    )
    if (
      userIds.some(({ userId: imageUserId }) => imageUserId !== userId) &&
      !isAdmin
    ) {
      return redirect('/error?message=No access')
    }

    const [albumId] = await Promise.all(jobs)
    return redirect(`/album/${albumId}`)
  },

  async PUT(req, ctx) {
    const { ids, albumId }: { ids: number[]; albumId: number } =
      await req.json()
    const joinedIds = ids.join(', ')

    const { db, user } = ctx.state
    const { id: userId, isAdmin } = user

    const userIds = db.queryEntries<Pick<Image, 'userId'>>(
      `SELECT userId FROM images WHERE id IN (${joinedIds})`
    )
    if (
      userIds.some(({ userId: imageUserId }) => imageUserId !== userId) &&
      !isAdmin
    ) {
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
      `UPDATE images SET albumId = :albumId WHERE id IN (${joinedIds})`,
      { albumId }
    )
    return redirect(`/album/${albumId}`)
  },
}

async function saveImage(
  db: DB,
  imageFile: File,
  userId: string,
  albumId: number
) {
  const time = getTime()
  const imagePath = await ImagePath.from(imageFile, time)

  const name = imagePath.originalName
  const ext = imagePath.ext
  const date = time.time
  const path = imagePath.toString()
  const size = imageFile.size

  const image = await processImage(await imageFile.arrayBuffer())
  const jobs = [
    image(imagePath.raw),
    image(imagePath.thumbnail(), { isThumbnail: true }),
    ...formats.map((format) =>
      image(imagePath.thumbnail(format), { format, isThumbnail: true })
    ),
  ]
  await Promise.all(jobs)

  db.queryEntries(
    `
  INSERT INTO images VALUES (
    NULL,
    :name,
    :ext,
    :date,
    :userId,
    :albumId,
    :path,
    :size
  )
`,
    { name, ext, date, userId, albumId, path, size } satisfies Omit<Image, 'id'>
  )
}

export function deleteImage(db: DB, id: number) {
  return db.transaction(() => {
    const { albumId, path } = db.queryEntries<Pick<Image, 'albumId' | 'path'>>(
      'DELETE FROM images WHERE id = :id RETURNING albumId, path',
      { id }
    )[0]

    const imagePath = new ImagePath(path)
    Deno.removeSync(imagePath.raw)

    const tmpDir = imagePath.tmpDir
    if (existsSync(tmpDir)) {
      Array.from(Deno.readDirSync(tmpDir))
        .filter(
          ({ name }) =>
            name.startsWith(imagePath.base) ||
            name.startsWith(basename(imagePath.thumbnail()))
        )
        .forEach(({ name }) => Deno.removeSync(join(tmpDir, name)))
    }

    return albumId
  })
}
