import type { Handlers } from '$fresh/server.ts'
import {
  UploadEvent,
  type UploadEventMapKey,
} from '../../../lib/UploadEvent.ts'

export const handler: Handlers = {
  GET(_req, ctx) {
    const { id } = ctx.params
    const uploadEvent = UploadEvent.pool.get(id)
    if (uploadEvent === undefined) {
      return ctx.renderNotFound()
    }

    const body = new ReadableStream({
      start(controller) {
        registerEvent(uploadEvent, 'progress', controller)
        registerEvent(uploadEvent, 'redirect', controller)
      },
      cancel() {
        uploadEvent.drop()
      },
    })

    return new Response(body, {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  },
}

function registerEvent(
  uploadEvent: UploadEvent,
  type: UploadEventMapKey,
  controller: ReadableStreamDefaultController
) {
  uploadEvent.addEventListener(type, ({ detail }) => {
    const message = new TextEncoder().encode(
      `event: ${type}\ndata: ${JSON.stringify(detail)}\n\n`
    )
    controller.enqueue(message)
  })
}
