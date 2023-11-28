import { RouteConfig, defineRoute } from '$fresh/server.ts'
import { join, extname } from '$std/path/mod.ts'
import { contentType } from '$std/media_types/mod.ts'

export const config: RouteConfig = {
  routeOverride: '/images/:year/:month/:day/:name',
}

export default defineRoute(async (req, ctx) => {
  const path = Object.values(ctx.params).join('/')
  const type = contentType(extname(ctx.params.name))
  if (type === undefined) {
    return new Response(null, {
      status: 400,
    })
  }

  const eTag = `"${await crypto.subtle
    .digest('SHA-1', new TextEncoder().encode(path))
    .then((hash) =>
      Array.from(new Uint8Array(hash))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
    )}"`
  const headers = {
    'Content-Type': type,
    ETag: eTag,
  }

  if (req.headers.get('If-None-Match') == eTag) {
    return new Response(null, {
      status: 304,
      headers,
    })
  }

  try {
    const imageFile = await Deno.readFile(join('./images/raw', path))
    return new Response(imageFile, {
      headers,
    })
  } catch {
    return ctx.renderNotFound()
  }
})
