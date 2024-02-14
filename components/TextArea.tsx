import { clsx } from 'clsx'
import type { JSX } from 'preact'

interface Props extends JSX.HTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export default function TextArea({
  label,
  children,
  class: className,
  ...props
}: Props) {
  return (
    <label class="block">
      <span class="text-gray-700">{label}</span>
      <textarea
        class={clsx(
          'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </textarea>
    </label>
  )
}
