import type { JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'

export default function Dialog({
  open,
  children,
  onClose,
}: JSX.HTMLAttributes<HTMLDialogElement>) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  })
  return (
    <dialog ref={dialogRef} class="p-6 rounded-xl" onClose={onClose}>
      {children}
    </dialog>
  )
}
