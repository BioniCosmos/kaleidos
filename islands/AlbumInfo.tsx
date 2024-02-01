import { useRef, useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import Form from '../components/Form.tsx'
import InfoButton from '../components/InfoButton.tsx'
import Input from '../components/Input.tsx'
import type { Album } from '../db.ts'
import { deleteContent } from '../utils.ts'

export default function AlbumInfo({
  album,
  count,
}: {
  album: Album
  count: number
}) {
  const [editIsOpen, setEditIsOpen] = useState(false)
  const [deleteIsOpen, setDeleteIsOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function editSubmit() {
    formRef.current?.submit()
  }

  const deleteSubmit = deleteContent('album', { id: album.id })

  return (
    <>
      <div class="flex bg-gray-200 rounded-lg shadow-lg">
        <div class="rounded-lg py-2 px-6 transition pointer-events-none">
          {count} image{count > 1 && 's'}
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
        title="Editing the album"
        onConfirm={editSubmit}
      >
        <Form method="post" action={`/album/${album.id}`} ref={formRef}>
          <Input label="Name" name="name" value={album.name} required />
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