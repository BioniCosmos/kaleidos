import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
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
      <button
        class="justify-center py-2 px-4 flex gap-3 items-center bg-red-500 text-white font-bold rounded-full hover:bg-red-700 transition"
        onClick={openDialog}
      >
        <Icon
          name="trash"
          options={{ width: 18, height: 18, 'stroke-width': 3 }}
        />
        <div>Delete</div>
      </button>
      <Dialog open={open} onClose={closeDialog}>
        <h2 class="text-2xl font-bold">Warning!</h2>
        <div class="mt-8">Are you sure to delete the content?</div>
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

function setToArray<T>(set: Set<T>) {
  return Array.from(set.values())
}
