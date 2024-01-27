import { useRef, useState } from 'preact/hooks'
import Icon from '../components/Icon.tsx'
import Dialog from './Dialog.tsx'

export default function DeleteImage() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  return (
    <>
      <form
        method="post"
        onSubmit={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
        ref={formRef}
      >
        <button class="py-2 px-4 flex gap-3 items-center fixed bottom-4 right-4 md:bottom-6 md:right-6 bg-red-500 text-white font-bold rounded-full hover:bg-red-700 transition">
          <Icon
            name="trash"
            options={{ width: 18, height: 18, 'stroke-width': 3 }}
          />
          <div>Delete</div>
        </button>
      </form>
      <Dialog
        open={open}
        onClose={(event) => {
          setOpen(false)
          if (event.currentTarget.returnValue === 'confirm') {
            formRef.current?.submit()
          }
        }}
      >
        <h2 class="text-2xl font-bold">Warning!</h2>
        <div class="mt-8">Are you sure to delete the image?</div>
        <form method="dialog" class="mt-6 flex justify-center gap-2">
          <button class="py-2 px-4 bg-red-500 text-white font-bold rounded-full hover:bg-red-700 transition focus:outline-none">
            Cancel
          </button>
          <button
            value="confirm"
            class="py-2 px-4 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition"
          >
            Confirm
          </button>
        </form>
      </Dialog>
    </>
  )
}
