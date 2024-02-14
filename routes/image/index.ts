import type { Handlers } from '$fresh/server.ts'
import { ensureFile, exists, existsSync } from '$std/fs/mod.ts'
import { basename, dirname, extname, join } from '$std/path/mod.ts'
import sharp from 'sharp'
import { db, type Album, type Image } from '../../db.ts'
import {
  fileNameWithSuffix,
  getPath,
  getTime,
  parseFileName,
  redirect,
} from '../../utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const imageFiles = formData.getAll('imageFile') as File[]
    const { id: userId } = ctx.state.user
    const albumId = Number(formData.get('albumId') as string)
    const jobs = imageFiles.map((imageFile) =>
      saveImage(imageFile, userId, albumId)
    )
    await Promise.all(jobs)
    return redirect(`/album/${albumId}`)
  },

  async DELETE(req, ctx) {
    const { id, selectedIds }: { id: number; selectedIds?: number[] } =
      await req.json()
    const ids = selectedIds ?? [id]
    const jobs = ids.map((id) => deleteImage(id))
    const userIds = db.queryEntries<Pick<Image, 'userId'>>(
      `SELECT userId FROM images WHERE id IN (${ids.join(', ')})`
    )
    const { id: userId, isAdmin } = ctx.state.user
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

    const userIds = db.queryEntries<Pick<Image, 'userId'>>(
      `SELECT userId FROM images WHERE id IN (${joinedIds})`
    )
    const { id: userId, isAdmin } = ctx.state.user
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

async function saveImage(imageFile: File, userId: string, albumId: number) {
  const { base: name, ext } = parseFileName(imageFile.name)
  const time = getTime()
  const date = time.time
  const needSuffix = await exists(
    join(Deno.cwd(), 'images/raw/', getPath(imageFile.name, time))
  )
  const path = getPath(
    needSuffix ? fileNameWithSuffix(imageFile.name) : imageFile.name,
    time
  )
  const size = imageFile.size

  const actualPath = join(Deno.cwd(), 'images/raw/', path)
  await ensureFile(actualPath)
  const image = sharp(await imageFile.arrayBuffer())
  const { orientation } = await image.metadata()
  await image
    .keepIccProfile()
    .withExif({})
    .withMetadata({ orientation })
    .toFile(actualPath)

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

export function deleteImage(id: number) {
  return db.transaction(() => {
    const { albumId, path } = db.queryEntries<Pick<Image, 'albumId' | 'path'>>(
      'DELETE FROM images WHERE id = :id RETURNING albumId, path',
      { id }
    )[0]

    const rawPath = join(Deno.cwd(), 'images/raw/', path)
    Deno.removeSync(rawPath)

    const tmpPath = join(Deno.cwd(), 'images/tmp/', path)
    const tmpDir = dirname(tmpPath)
    if (existsSync(tmpDir)) {
      Array.from(Deno.readDirSync(dirname(tmpPath)))
        .filter(({ name }) => name.startsWith(basename(path)))
        .forEach(({ name }) => Deno.removeSync(tmpPath + extname(name)))
    }

    return albumId
  })
}
