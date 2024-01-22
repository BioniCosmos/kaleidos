import type { Handlers } from '$fresh/server.ts'
import { ensureFile, exists } from '$std/fs/mod.ts'
import { join } from '$std/path/mod.ts'
import { db, type Image } from '../../db.ts'
import {
  fileNameWithSuffix,
  getPath,
  getTime,
  parseFileName,
  redirect,
} from '../../utils.ts'
import type { State } from '../_middleware.tsx'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const formData = await req.formData()
    const imageFile = formData.get('imageFile') as File

    const { base: name, ext } = parseFileName(imageFile.name)
    const time = getTime()
    const date = time.time
    const { userId } = ctx.state
    const albumId = Number(formData.get('albumId') as string)
    const needSuffix = await exists(imageFile.name)
    const path = getPath(
      needSuffix ? fileNameWithSuffix(imageFile.name) : imageFile.name,
      time
    )

    const actualPath = join(Deno.cwd(), 'images/raw/', path)
    await ensureFile(actualPath)
    await Deno.writeFile(actualPath, imageFile.stream())

    const { id } = db.queryEntries<{ id: number }>(
      `
      INSERT INTO images VALUES (
        NULL,
        :name,
        :ext,
        :date,
        :userId,
        :albumId,
        :path
      ) RETURNING id
    `,
      { name, ext, date, userId, albumId, path } satisfies Image
    )[0]
    return redirect(`/image/${id}`)
  },
}
