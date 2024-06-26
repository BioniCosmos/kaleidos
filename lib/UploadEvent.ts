export interface UploadEventMap {
  progress: { total: number; completed: number }
  redirect: { lastPage: number }
}
export type UploadEventMapKey = keyof UploadEventMap
export type UploadEventMapValue = UploadEventMap[UploadEventMapKey]

export class UploadEvent {
  static pool = new Map<string, UploadEvent>()

  static of() {
    const uploadEvent = new UploadEvent()
    const id = uploadEvent.#id
    UploadEvent.pool.set(id, uploadEvent)
    return { id, uploadEvent }
  }

  #id = crypto.randomUUID()
  #event = new EventTarget()
  // deno-lint-ignore no-explicit-any
  #listeners = Array.of<{ id: string; params: [any, any, any] }>()
  #messages = Array.of<{ type: UploadEventMapKey; data: UploadEventMapValue }>()
  #timer = setInterval(() => {
    if (this.#messages.length !== 0 && this.#listeners.length !== 0) {
      const { type, data } = this.#messages.shift()!
      this.#event.dispatchEvent(new CustomEvent(type, { detail: data }))
    }
  }, 100)

  addEventListener<K extends UploadEventMapKey>(
    type: K,
    callback: (event: CustomEvent<UploadEventMap[K]>) => void,
    options?: boolean | AddEventListenerOptions
  ) {
    this.#event.addEventListener(
      type,
      callback as unknown as EventListener,
      options
    )

    const id = crypto.randomUUID()
    this.#listeners.push({ id, params: [type, callback, options] })

    return id
  }

  removeEventListener(listenerId: string) {
    this.#listeners = this.#listeners.filter(({ id, params }) => {
      if (id === listenerId) {
        this.#event.removeEventListener(...params)
        return false
      }
      return true
    })
  }

  dispatchEvent<K extends UploadEventMapKey>(type: K, data: UploadEventMap[K]) {
    this.#messages.push({ type, data })
  }

  drop() {
    this.#listeners.forEach(({ id }) => this.removeEventListener(id))
    clearInterval(this.#timer)
    UploadEvent.pool.delete(this.#id)
  }
}
