import { useRef, useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import Form from '../components/Form.tsx'
import InfoButton from '../components/InfoButton.tsx'
import Input from '../components/Input.tsx'
import type { Album } from '../db.ts'
import { sendJSON } from '../utils.ts'

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

  const deleteSubmit = sendJSON('album', 'DELETE', { id: album.id })

  return (
    <>
      <div class="flex bg-gray-200 dark:bg-zinc-500 rounded-lg shadow-lg">
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
        onClickConfirm={editSubmit}
      >
        <Form method="post" action={`/album/${album.id}`} ref={formRef}>
          <Input label="Name" name="name" value={album.name} required />
        </Form>
      </Dialog>
      <Dialog
        open={deleteIsOpen}
        close={() => setDeleteIsOpen(false)}
        title="Warning!"
        onClickConfirm={deleteSubmit}
      >
        <div>Are you sure to delete the content?</div>
      </Dialog>
    </>
  )
}
