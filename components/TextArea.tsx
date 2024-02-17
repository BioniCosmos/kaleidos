import { clsx } from 'clsx'
import type { JSX } from 'preact'
import { useRef } from 'preact/hooks'
import { useId } from '../utils.ts'

interface Props extends JSX.HTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export default function TextArea({
  label,
  children,
  class: className,
  ...props
}: Props) {
  const id = useId()
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  function handleClick(event: JSX.TargetedMouseEvent<HTMLLabelElement>) {
    event.preventDefault()
    textAreaRef.current?.setSelectionRange(0, 0)
    textAreaRef.current?.focus()
  }

  return (
    <div>
      <label for={id} class="text-gray-700" onClick={handleClick}>
        {label}
      </label>
      <textarea
        id={id}
        class={clsx(
          'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
          className
        )}
        {...props}
        ref={textAreaRef}
      >
        {children}
      </textarea>
    </div>
  )
}
