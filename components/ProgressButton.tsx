import { clsx } from 'clsx'
import type { ComponentChildren, JSX } from 'preact'
import Button from './Button.tsx'
import Icon from './Icon.tsx'

interface Props extends JSX.HTMLAttributes<HTMLButtonElement> {
  progress: number | `${number}%`
  children: ComponentChildren
}

export default function ProgressButton({
  progress,
  children,
  ...props
}: Props) {
  const p = typeof progress === 'number' ? `${progress}%` : progress
  return (
    <div class="relative bg-blue-500 rounded-full">
      <div
        class={clsx(
          'bg-blue-700 transition-all absolute inset-0 rounded-full z-0',
          parseFloat(p) > 5 ? 'opacity-100' : 'opacity-0'
        )}
        style={{ width: p }}
      />
      <Button
        class={clsx(
          'w-full bg-transparent hover:bg-transparent relative z-10',
          { 'pointer-events-none': p !== '0%' }
        )}
        {...props}
      >
        {p === '100%' ? (
          <Icon name="check" options={{ class: 'mx-auto' }} />
        ) : (
          children
        )}
      </Button>
    </div>
  )
}
