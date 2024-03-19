import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import FloatButton from '../components/FloatButton.tsx'
import { sendJSON, setToArray } from '../utils.ts'

interface CommonProps {
  target: 'image' | 'album'
}

interface IdProps extends CommonProps {
  id: number
}

interface SelectedIdsProps extends CommonProps {
  selectedIds: Set<number>
}

export default function DeleteSelection({ target, id }: IdProps): JSX.Element
export default function DeleteSelection({
  target,
  selectedIds,
}: SelectedIdsProps): JSX.Element

export default function DeleteSelection({
  target,
  ...props
}: IdProps | SelectedIdsProps) {
  const [open, setOpen] = useState(false)

  function openDialog() {
    setOpen(true)
  }

  const submit = sendJSON(
    target,
    'DELETE',
    'id' in props
      ? { id: props.id }
      : { selectedIds: setToArray(props.selectedIds) }
  )

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
