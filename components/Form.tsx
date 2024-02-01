import { clsx } from 'clsx'
import type { JSX } from 'preact'
import { forwardRef } from 'preact/compat'

const Form = forwardRef<HTMLFormElement, JSX.HTMLAttributes<HTMLFormElement>>(
  (props, ref) => (
    <form
      class={clsx('grid grid-cols-1 gap-6', props.class)}
      {...props}
      ref={ref}
    />
  )
)

export default Form
