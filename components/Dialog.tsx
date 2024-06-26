import type { JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import Button from './Button.tsx'

interface Props extends JSX.HTMLAttributes<HTMLDialogElement> {
  title?: string
  close: () => void
  onClickConfirm: () => unknown | Promise<unknown> | false
  onClickCancel?: () => void
  cleanup?: () => void
  cancelDisabled?: boolean
}

export default function Dialog({
  open,
  children,
  close,
  title,
  cleanup,
  onClickConfirm,
  onClickCancel,
  cancelDisabled = false,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [isWorking, setIsWorking] = useState(false)

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
      cleanup?.()
      setIsWorking(false)
    }
  }, [open])

  async function handleClose(value: string) {
    if (value === 'confirm') {
      const toConfirm = onClickConfirm()
      if (toConfirm === false) {
        return
      }

      setIsWorking(true)
      if (toConfirm instanceof Promise) {
        await toConfirm
      }
    } else {
      onClickCancel?.()
    }
    close()
  }

  return (
    <dialog
      ref={dialogRef}
      class="p-6 rounded-xl space-y-8 dark:bg-zinc-950 dark:text-zinc-50 dark:border-zinc-800 dark:border !m-auto"
    >
      {title !== undefined && <h2 class="text-2xl font-bold">{title}</h2>}
      <div class="space-y-6 dark:text-zinc-50 dark:text-opacity-60">
        {children}
        <form
          method="dialog"
          class="flex justify-center gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            handleClose((event.submitter as HTMLButtonElement).value)
          }}
        >
          <Button color="red" value="close" disabled={cancelDisabled}>
            Cancel
          </Button>
          <Button value="confirm" disabled={isWorking}>
            Confirm
          </Button>
        </form>
      </div>
    </dialog>
  )
}
