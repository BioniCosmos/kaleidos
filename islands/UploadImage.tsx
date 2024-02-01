import type { JSX } from 'preact'
import { useRef, useState } from 'preact/hooks'
import Button from '../components/Button.tsx'
import Dialog from '../components/Dialog.tsx'
import Icon from '../components/Icon.tsx'

export default function UploadImage({ albumId }: { albumId: number }) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  function preview(event: JSX.TargetedEvent<HTMLInputElement>) {
    const files = event.currentTarget.files
    if (files === null) {
      return
    }

    setImages(Array.from(files).map((file) => URL.createObjectURL(file)))
    setOpen(true)
  }

  return (
    <form method="post" action="/image" enctype="multipart/form-data">
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
        onClose={() => {
          images.forEach((image) => URL.revokeObjectURL(image))
          inputRef.current!.value = ''
        }}
      >
        <div class="flex flex-wrap justify-center gap-4">
          {images.map((image) => (
            <img src={image} class="w-28 h-28 object-cover rounded" />
          ))}
        </div>
        <div class="mt-6 flex justify-center gap-2">
          <Button color="red" type="button" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button>Confirm</Button>
        </div>
      </Dialog>
    </form>
  )
}
