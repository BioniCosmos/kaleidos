import type { Handlers } from '$fresh/server.ts'
import { ensureDir, walk } from '$std/fs/mod.ts'
import { dirname, join } from '$std/path/mod.ts'
import type { DB } from 'sqlite'
import config from '../../config.ts'
import { ImagePath } from '../../lib/ImagePath.ts'
import { UploadEvent } from '../../lib/UploadEvent.ts'
import type { Image } from '../../lib/db.ts'
import {
  prepareFormatVariants,
  prepareThumbnailVariants,
  processImages,
} from '../../lib/process-image.ts'
import { redirect } from '../../lib/utils.ts'
import type { State } from '../_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async GET(_req, ctx) {
    const { db, user } = ctx.state
    if (!user.isAdmin) {
      return redirect('/error?message=No access')
    }

    const operation = ctx.url.searchParams.get('operation')
    if (operation !== 'format' && operation !== 'thumbnail') {
      return redirect('/error?message=Unsupported operation')
    }

    const { uploadEvent } = UploadEvent.of()
    const inMessages = await getLackVariants(db, operation)
    const outMessages = await processImages(inMessages, uploadEvent)
    const jobs = outMessages
      .flatMap(({ variants }) => variants)
      .map(({ tmpFile, file }) =>
        ensureDir(dirname(file)).then(() => Deno.rename(tmpFile, file))
      )
    await Promise.all(jobs)
    return redirect('/settings')
  },
}

async function getLackVariants(db: DB, operation: 'format' | 'thumbnail') {
  const converted = await Array.fromAsync(
    walk(join(config.workingDir, 'images/tmp'), {
      includeDirs: false,
      match: operation === 'format' ? [/^(?!.*\.tn\.).*$/] : [/.*\.tn\..*/],
    })
  ).then((entries) => entries.map(({ path }) => path))
  return db
    .queryEntries<Pick<Image, 'path'>>('SELECT path FROM images')
    .map(({ path }) => new ImagePath(path))
    .map((imagePath) => ({
      input: imagePath.raw,
      variants:
        operation === 'format'
          ? prepareFormatVariants(imagePath)
          : prepareThumbnailVariants(imagePath),
    }))
    .map(({ input, variants }) => ({
      input,
      variants: variants.filter(({ output }) => !converted.includes(output)),
    }))
}
