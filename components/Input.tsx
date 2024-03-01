import { clsx } from 'clsx'
import type { JSX } from 'preact'
import { useRef } from 'preact/hooks'
import { useId } from '../utils.ts'

interface Props extends JSX.HTMLAttributes<HTMLInputElement> {
  label: string
}

export default function Input({ label, class: className, ...props }: Props) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClick(event: JSX.TargetedMouseEvent<HTMLLabelElement>) {
    event.preventDefault()
    inputRef.current?.setSelectionRange(0, 0, 'forward')
    inputRef.current?.focus()
  }

  return (
    <div>
      <label
        for={id}
        class="text-gray-700 dark:text-zinc-50 dark:text-opacity-60"
        onClick={handleClick}
      >
        {label}
      </label>
      <input
        id={id}
        class={clsx(
          'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
          className,
          'dark:bg-transparent dark:text-zinc-50 dark:focus:ring-0 dark:focus:border-gray-300 dark:border-opacity-40 dark:focus:border-opacity-100'
        )}
        {...props}
        ref={inputRef}
      />
    </div>
  )
}
