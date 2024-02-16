import type { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import Icon from '../components/Icon.tsx'

export default function UploadImage({ albumId }: { albumId: number }) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

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
  }

  function submit() {
    formRef.current?.submit()
  }

  return (
    <form
      method="post"
      action="/image"
      enctype="multipart/form-data"
      ref={formRef}
    >
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
        onClose={clean}
        onConfirm={submit}
      >
        <div class="flex flex-wrap justify-center gap-4">
          {images.map((image) => (
            <img src={image} class="size-28 object-cover rounded" />
          ))}
        </div>
      </Dialog>
    </form>
  )
}
