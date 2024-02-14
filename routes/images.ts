import { type Handlers, type RouteConfig } from '$fresh/server.ts'
import { ensureFile, exists } from '$std/fs/mod.ts'
import { contentType } from '$std/media_types/mod.ts'
import { join } from '$std/path/mod.ts'
import sharp from 'sharp'
import conf from '../config.ts'
import { parseFileName } from '../utils.ts'

export const config: RouteConfig = {
  routeOverride: '/images/:year/:month/:day/:name',
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const path = decodeURIComponent(Object.values(ctx.params).join('/'))
    const format = ctx.url.searchParams.get('format')
    const { ext } = parseFileName(path)
    const needConvert =
      format !== null &&
      format !== ext &&
      (format === 'webp' || format === 'avif')
    const rawPath = join(conf.workingDir, 'images/raw/', path)
    const actualPath = needConvert
      ? join(conf.workingDir, 'images/tmp/', `${path}.${format}`)
      : rawPath
    const type = contentType(needConvert ? format : ext)
    if (type === undefined) {
      return new Response(null, {
        status: 400,
      })
    }

    const eTag = `"${await crypto.subtle
      .digest('SHA-1', new TextEncoder().encode(actualPath))
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('')
      )}"`
    const headers = { 'Content-Type': type, ETag: eTag }
    if (req.headers.get('If-None-Match') === eTag) {
      return new Response(null, { status: 304, headers })
    }

    if (needConvert && !(await exists(actualPath))) {
      await ensureFile(actualPath)
      const image = sharp(rawPath)
      const { orientation } = await image.metadata()
      await image
        .keepIccProfile()
        .withExif({})
        .withMetadata({ orientation })
        .toFormat(format)
        .toFile(actualPath)
    }

    try {
      const imageFile = await Deno.readFile(actualPath)
      return new Response(imageFile, { headers })
    } catch {
      return ctx.renderNotFound()
    }
  },
}
