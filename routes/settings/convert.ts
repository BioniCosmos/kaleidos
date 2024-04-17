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
  async POST(req, ctx) {
    const { db, user } = ctx.state
    if (!user.isAdmin) {
      return redirect('/error?message=No access')
    }

    const { operation }: { operation: string } = await req.json()
    if (operation !== 'format' && operation !== 'thumbnail') {
      return redirect('/error?message=Unsupported operation')
    }

    const { id, uploadEvent } = UploadEvent.of()
    const convert = async () => {
      const outMessages = await getLackVariants(db, operation).then(
        (inMessages) => processImages(inMessages, uploadEvent)
      )
      const jobs = outMessages
        .flatMap(({ variants }) => variants)
        .map(({ tmpFile, file }) =>
          ensureDir(dirname(file)).then(() => Deno.rename(tmpFile, file))
        )
      await Promise.all(jobs)
    }
    convert()
    return new Response(id, { status: 202 })
  },
}

async function getLackVariants(db: DB, operation: 'format' | 'thumbnail') {
  const tmpDir = join(config.workingDir, 'images/tmp')
  await ensureDir(tmpDir)
  const converted = await Array.fromAsync(
    walk(tmpDir, {
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
