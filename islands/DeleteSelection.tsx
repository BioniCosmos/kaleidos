import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import Button from '../components/Button.tsx'
import Dialog from '../components/Dialog.tsx'
import Icon from '../components/Icon.tsx'

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

  function closeDialog(event: JSX.TargetedEvent<HTMLDialogElement>) {
    setOpen(false)
    if (event.currentTarget.returnValue !== 'confirm') {
      return
    }

    fetch(`/${target}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(
        'id' in props
          ? { id: props.id }
          : { selectedIds: setToArray(props.selectedIds) }
      ),
    }).then((value) => location.assign(value.url))
  }

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
      <Dialog open={open} onClose={closeDialog}>
        <h2 class="text-2xl font-bold">Warning!</h2>
        <div class="mt-8">Are you sure to delete the content?</div>
        <form method="dialog" class="mt-6 flex justify-center gap-2">
          <Button color="red">Cancel</Button>
          <Button value="confirm">Confirm</Button>
        </form>
      </Dialog>
    </>
  )
}

function setToArray<T>(set: Set<T>) {
  return Array.from(set.values())
}
