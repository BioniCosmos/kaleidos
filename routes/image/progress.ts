import type { Handlers } from '$fresh/server.ts'

export const handler: Handlers = {
  GET() {
    let handler: EventListener
    const body = new ReadableStream({
      start(controller) {
        handler = ((event: CustomEvent) => {
          const message = new TextEncoder().encode(
            `data: ${JSON.stringify(event.detail)}\n\n`
          )
          controller.enqueue(message)
        }) as EventListener
        addEventListener('progress', handler)
      },
      cancel() {
        removeEventListener('progress', handler)
      },
    })
    return new Response(body, {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  },
}
