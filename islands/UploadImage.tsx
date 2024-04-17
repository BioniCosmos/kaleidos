import type { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import Icon from '../components/Icon.tsx'
import type { UploadEventMap } from '../lib/UploadEvent.ts'
import { getProgress } from '../lib/utils.ts'

export default function UploadImage({ albumId }: { albumId: number }) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

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
  }

  const [transferProgress, setTransferProgress] = useState<Pick<
    ProgressEvent,
    'loaded' | 'total'
  > | null>(null)
  const cancelDisabled =
    transferProgress !== null &&
    transferProgress.loaded === transferProgress.total

  const [processProgress, setProcessProgress] = useState<
    UploadEventMap['progress'] | null
  >(null)

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
        if (xhrRef.current?.status === 202) {
          const id = xhrRef.current.responseText
          const es = new EventSource(`/image/progress/${id}`)
          es.addEventListener('progress', ({ data }) => {
            setProcessProgress(JSON.parse(data))
          })
          es.addEventListener('redirect', ({ data }) => {
            const { lastPage } = JSON.parse(data)
            es.close()
            location.replace(`/album/${albumId}?page=${lastPage}`)
          })
        }
        xhrRef.current?.removeEventListener('loadend', loadEndHandler)
      }
      xhrRef.current.addEventListener('loadend', loadEndHandler)

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
              style={{ width: getProgress(processProgress, transferProgress) }}
            >
              {getProgress(processProgress, transferProgress, true)}
            </div>
          </div>
        )}
      </Dialog>
    </form>
  )
}
