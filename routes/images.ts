import { type Handlers, type RouteConfig } from '$fresh/server.ts'
import { exists } from '$std/fs/mod.ts'
import { contentType } from '$std/media_types/mod.ts'
import { ImagePath, formats, processImage, type Format } from '../ImagePath.ts'

export const config: RouteConfig = {
  routeOverride: '/images/:year/:month/:day/:name',
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const path = decodeURIComponent(Object.values(ctx.params).join('/'))
    const imagePath = new ImagePath(path)
    const format = ctx.url.searchParams.get('format') as Format | null
    const isThumbnail = ctx.url.searchParams.get('thumbnail') === 'true'

    const needConvert =
      format !== null && format !== imagePath.ext && formats.includes(format)
    const actualPath = isThumbnail
      ? needConvert
        ? imagePath.thumbnail(format)
        : imagePath.thumbnail()
      : needConvert
      ? imagePath.converted(format)
      : imagePath.raw
    const type = contentType(needConvert ? format : imagePath.ext)
    if (type === undefined) {
      return new Response(null, {
        status: 400,
      })
    }

    if (!(await exists(imagePath.raw))) {
      return ctx.renderNotFound()
    }

    if (needConvert && !(await exists(actualPath))) {
      await (
        await processImage(imagePath.raw)
      )(actualPath, { format, isThumbnail })
    }

    const imageFile = await Deno.readFile(actualPath)
    const eTag = `"${await crypto.subtle
      .digest('SHA-1', imageFile)
      .then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((byte) => byte.toString(16).padStart(2, '0'))
          .join('')
      )}"`
    const headers = { 'Content-Type': type, ETag: eTag }
    if (req.headers.get('If-None-Match') === eTag) {
      return new Response(null, { status: 304, headers })
    }

    return new Response(imageFile, { headers })
  },
}
