import { useState } from 'preact/hooks'
import Dialog from './Dialog.tsx'

export default function NewAlbum() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        class="py-2 px-4 flex gap-3 items-center fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition"
      >
        <span class="text-2xl">+</span>
        <span>New album</span>
      </button>
      <Dialog open={open}>
        <h2 class="text-2xl font-bold">New album</h2>
        <form method="post" action="/album" class="mt-8 flex flex-col gap-6">
          <label class="block">
            <span class="text-gray-700">Name</span>
            <input
              type="text"
              name="name"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </label>
          <div class="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              class="py-2 px-4 bg-red-500 text-white font-bold rounded-full hover:bg-red-700 transition focus:outline-none"
            >
              Close
            </button>
            <button class="py-2 px-4 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition">
              Create
            </button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
