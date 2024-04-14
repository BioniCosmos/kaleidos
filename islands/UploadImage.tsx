import type { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import Icon from '../components/Icon.tsx'

export default function UploadImage({ albumId }: { albumId: number }) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const eventSourceRef = useRef<EventSource>()
  const messageHandlerRef = useRef<(event: MessageEvent) => void>()

  function preview(event: JSX.TargetedEvent<HTMLInputElement>) {
    const files = event.currentTarget.files
    if (files === null) {
      return
    }

    setImages(Array.from(files).map((file) => URL.createObjectURL(file)))
    setOpen(true)
  }

  function clean() {
    images.forEach((image) => URL.revokeObjectURL(image))
    inputRef.current!.value = ''
    setTransferProgress(null)
    setProcessProgress(null)
    eventSourceRef.current?.close()
    eventSourceRef.current?.removeEventListener(
      'message',
      messageHandlerRef.current!
    )
  }

  interface TransferProgress {
    loaded: number
    total: number
  }
  const [transferProgress, setTransferProgress] =
    useState<TransferProgress | null>(null)
  const cancelDisabled =
    transferProgress !== null &&
    transferProgress.loaded === transferProgress.total

  interface ProcessProgress {
    completed: number
    total: number
  }
  const [processProgress, setProcessProgress] =
    useState<ProcessProgress | null>(null)

  const getProgress = (round = false) => {
    const { loaded: transferLoaded, total: transferTotal } =
      transferProgress ?? { loaded: 0, total: 1 }
    const { completed: processCompleted, total: processTotal } =
      processProgress ?? { completed: 0, total: 1 }

    const percent =
      (transferLoaded / transferTotal) * 50 +
      (processCompleted / processTotal) * 50
    return `${round ? Math.round(percent) : percent}%`
  }

  function submit() {
    return new Promise<void>(() => {
      xhrRef.current = new XMLHttpRequest()
      const formData = new FormData(formRef.current!)

      const progressHandler = ({
        loaded,
        total,
      }: ProgressEvent<XMLHttpRequestEventTarget>) =>
        setTransferProgress({ loaded, total })
      xhrRef.current.upload.addEventListener('progress', progressHandler)

      const loadEndHandler = () => {
        xhrRef.current?.upload.removeEventListener('progress', progressHandler)
        if (xhrRef.current?.status === 200) {
          location.assign(xhrRef.current.responseURL)
        }
        xhrRef.current?.removeEventListener('loadend', loadEndHandler)
      }
      xhrRef.current.addEventListener('loadend', loadEndHandler)

      eventSourceRef.current = new EventSource('/image/progress')
      messageHandlerRef.current = (event: MessageEvent) =>
        setProcessProgress(JSON.parse(event.data))
      eventSourceRef.current.addEventListener(
        'message',
        messageHandlerRef.current
      )

      xhrRef.current.open('POST', '/image')
      xhrRef.current.send(formData)
    })
  }

  return (
    <form ref={formRef}>
      <label
        role="button"
        class="justify-center py-2 px-4 flex gap-3 items-center bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition"
      >
        <Icon
          name="upload"
          options={{ width: 18, height: 18, 'stroke-width': 3 }}
        />
        <div>Upload</div>
        <input
          name="imageFile"
          type="file"
          required
          multiple
          accept="image/*"
          class="hidden"
          onChange={preview}
          ref={inputRef}
        />
      </label>
      <input name="albumId" type="hidden" value={albumId} />
      <Dialog
        open={open}
        close={() => setOpen(false)}
        cleanup={clean}
        onClickConfirm={submit}
        onClickCancel={() => xhrRef.current?.abort()}
        cancelDisabled={cancelDisabled}
      >
        <div class="flex flex-wrap justify-center gap-4">
          {images.map((image) => (
            <img src={image} class="size-28 object-cover rounded" />
          ))}
        </div>
        {transferProgress !== null && (
          <div class="w-full bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              class="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
              style={{ width: getProgress() }}
            >
              {getProgress(true)}
            </div>
          </div>
        )}
      </Dialog>
    </form>
  )
}
