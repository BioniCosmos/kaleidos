import { useState } from 'preact/hooks'
import Dialog from './Dialog.tsx'

export default function Upload({ albumId }: { albumId: number }) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])

  function preview(event: Event) {
    if (
      !(event.target instanceof HTMLInputElement) ||
      event.target.files === null
    ) {
      return
    }

    setImages(
      Array.from(event.target.files).map((file) => URL.createObjectURL(file))
    )
    setOpen(true)
  }

  return (
    <form method="post" action="/image" enctype="multipart/form-data">
      <label
        role="button"
        class="py-2 px-4 flex gap-3 items-center fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition"
      >
        <span class="text-2xl">↑</span>
        <span>Upload</span>
        <input
          name="imageFile"
          type="file"
          required
          multiple
          accept="image/*"
          class="hidden"
          onChange={preview}
        />
      </label>
      <input name="albumId" type="hidden" value={albumId} />
      <Dialog
        open={open}
        class="p-6 rounded space-y-4"
        onClose={() => {
          images.forEach((image) => URL.revokeObjectURL(image))
        }}
      >
        <div class="flex flex-wrap justify-center gap-4">
          {images.map((image) => (
            <img src={image} class="w-28 h-28 object-cover rounded" />
          ))}
        </div>
        <div class="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            class="py-2 px-4 bg-red-500 text-white font-bold rounded-full hover:bg-red-700 transition focus:outline-none"
          >
            Close
          </button>
          <button class="py-2 px-4 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition">
            Confirm
          </button>
        </div>
      </Dialog>
    </form>
  )
}
