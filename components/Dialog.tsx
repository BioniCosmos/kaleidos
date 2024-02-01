import type { JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import Button from './Button.tsx'

export default function Dialog({
  open,
  children,
  close,
  title,
  onClose,
  onConfirm,
}: Omit<JSX.HTMLAttributes<HTMLDialogElement>, 'title'> & {
  title?: string
  close: () => void
  onConfirm?: JSX.GenericEventHandler<HTMLDialogElement>
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  })

  function handleClose(event: JSX.TargetedEvent<HTMLDialogElement>) {
    if (event.currentTarget.returnValue === 'confirm') {
      onConfirm?.(event)
    }
    onClose?.(event)
    close()
  }

  return (
    <dialog
      ref={dialogRef}
      class="p-6 rounded-xl space-y-8"
      onClose={handleClose}
    >
      {title !== undefined && <h2 class="text-2xl font-bold">{title}</h2>}
      <div class="space-y-6">
        {children}
        <form method="dialog" class="flex justify-center gap-2">
          <Button color="red" value="close">
            Cancel
          </Button>
          <Button value="confirm">Confirm</Button>
        </form>
      </div>
    </dialog>
  )
}
