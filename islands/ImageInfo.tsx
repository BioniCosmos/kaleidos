import { useRef, useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import Form from '../components/Form.tsx'
import InfoButton from '../components/InfoButton.tsx'
import Input from '../components/Input.tsx'
import SelectMenu from '../components/SelectMenu.tsx'
import type { Image } from '../db.ts'
import { sendJSON } from './utils.ts'

export default function ImageInfo({
  image,
  options,
}: {
  image: Image
  options: Parameters<typeof SelectMenu>[0]['options']
}) {
  const [editIsOpen, setEditIsOpen] = useState(false)
  const [deleteIsOpen, setDeleteIsOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function editSubmit() {
    formRef.current?.submit()
  }

  const deleteSubmit = sendJSON('image', 'DELETE', { id: image.id })

  return (
    <>
      <div class="flex bg-gray-200 rounded-lg shadow-lg">
        <div class="rounded-lg py-2 px-6 transition pointer-events-none">
          {formatBytes(image.size)}
        </div>
        <InfoButton
          label="Edit"
          iconName="edit"
          onClick={() => setEditIsOpen(true)}
        />
        <InfoButton
          label="Delete"
          iconName="trash"
          onClick={() => setDeleteIsOpen(true)}
        />
      </div>
      <Dialog
        open={editIsOpen}
        close={() => setEditIsOpen(false)}
        title="Editing the image"
        onConfirm={editSubmit}
      >
        <Form method="post" action={`/image/${image.id}`} ref={formRef}>
          <Input label="Name" name="name" value={image.name} required />
          <SelectMenu
            label="Album"
            name="albumId"
            options={options}
            value={image.albumId}
            required
          />
        </Form>
      </Dialog>
      <Dialog
        open={deleteIsOpen}
        close={() => setDeleteIsOpen(false)}
        title="Warning!"
        onConfirm={deleteSubmit}
      >
        <div>Are you sure to delete the content?</div>
      </Dialog>
    </>
  )
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes'
  }

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}
