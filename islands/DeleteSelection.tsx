import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import Button from '../components/Button.tsx'
import Dialog from '../components/Dialog.tsx'
import Icon from '../components/Icon.tsx'
import { deleteContent } from '../utils.ts'

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

  const submit = deleteContent(
    target,
    'id' in props
      ? { id: props.id }
      : { selectedIds: setToArray(props.selectedIds) }
  )

  return (
    <>
      <Button
        color="red"
        class="flex gap-3 items-center justify-center"
        onClick={openDialog}
      >
        <Icon
          name="trash"
          options={{ width: 18, height: 18, 'stroke-width': 3 }}
        />
        <div>Delete</div>
      </Button>
      <Dialog
        open={open}
        title="Warning!"
        close={() => setOpen(false)}
        onConfirm={submit}
      >
        <div>Are you sure to delete the content?</div>
      </Dialog>
    </>
  )
}

function setToArray<T>(set: Set<T>) {
  return Array.from(set.values())
}
