import { clsx } from 'clsx'
import type { JSX } from 'preact'

export default function Form({
  class: className,
  ...props
}: JSX.HTMLAttributes<HTMLFormElement>) {
  return <form class={clsx('grid grid-cols-1 gap-6', className)} {...props} />
}
