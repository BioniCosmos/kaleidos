import type { Handlers } from '$fresh/server.ts'
import { existsSync } from '$std/fs/mod.ts'
import { basename, join } from '$std/path/mod.ts'
import type { DB } from 'sqlite'
import { ImagePath } from '../../lib/ImagePath.ts'
import { UploadEvent } from '../../lib/UploadEvent.ts'
import {
  authorizeAlbumOwner,
  authorizeImageOwner,
  type Image,
} from '../../lib/db.ts'
import { uploadImages } from '../../lib/process-image.ts'
import { redirect } from '../../lib/utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const imageFiles = formData.getAll('imageFile') as File[]
    const { db } = ctx.state
    const albumId = Number(formData.get('albumId') as string)

    const { id, uploadEvent } = UploadEvent.of()
    uploadImages(db, imageFiles, albumId, uploadEvent)
    return new Response(id, { status: 202 })
  },

  async DELETE(req, ctx) {
    const { db, user } = ctx.state
    const { id: userId, isAdmin } = user

    const { ids }: { ids: number[] } = await req.json()
    if (!authorizeImageOwner(db, ids, userId, isAdmin)) {
      return redirect('/error?message=No access')
    }

    const jobs = ids.map((id) => deleteImage(db, id))
    const [albumId] = await Promise.all(jobs)
    return redirect(`/album/${albumId}`)
  },

  async PUT(req, ctx) {
    const { ids, albumId }: { ids: number[]; albumId: number } =
      await req.json()
    const joinedIds = ids.join(', ')

    const { db, user } = ctx.state
    const { id: userId, isAdmin } = user

    if (
      !authorizeImageOwner(db, ids, userId, isAdmin) ||
      !authorizeAlbumOwner(db, albumId, userId, isAdmin)
    ) {
      return redirect('/error?message=No access')
    }

    db.query(
      `UPDATE images SET albumId = :albumId WHERE id IN (${joinedIds})`,
      { albumId }
    )
    return redirect(`/album/${albumId}`)
  },
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
