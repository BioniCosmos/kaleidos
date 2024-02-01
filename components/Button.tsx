import { clsx } from 'clsx'
import type { JSX } from 'preact'

interface Props extends JSX.HTMLAttributes<HTMLButtonElement> {
  color?: 'blue' | 'red'
}

export default function Button({
  color = 'blue',
  class: className,
  children,
  ...props
}: Props) {
  const colors = {
    blue: 'bg-blue-500 hover:bg-blue-700',
    red: 'bg-red-500 hover:bg-red-700',
  }
  return (
    <button
      class={clsx(
        'py-2 px-4 text-white font-bold rounded-full transition text-center',
        colors[color],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
