import { useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import FloatButton from '../components/FloatButton.tsx'
import { sendJSON, setToArray } from '../lib/utils.ts'

interface Props {
  target: 'image' | 'album'
  idSet: Set<number>
}

export default function DeleteSelection({ target, idSet }: Props) {
  const [open, setOpen] = useState(false)

  function openDialog() {
    setOpen(true)
  }

  const submit = sendJSON(target, 'DELETE', {
    ids: setToArray(idSet),
  })

  return (
    <>
      <FloatButton
        label="Delete"
        color="red"
        iconName="trash"
        onClick={openDialog}
      />
      <Dialog
        open={open}
        title="Warning!"
        close={() => setOpen(false)}
        onClickConfirm={submit}
      >
        <div>Are you sure to delete the content?</div>
      </Dialog>
    </>
  )
}
