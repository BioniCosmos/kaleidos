import { clsx } from 'clsx'
import type { JSX } from 'preact'

interface Props extends Omit<JSX.HTMLAttributes<HTMLInputElement>, 'id'> {
  id: number
  selectedIds: Set<number>
}

export default function Checkbox({ id, selectedIds, onChange }: Props) {
  return (
    <input
      type="checkbox"
      class={clsx(
        'absolute top-2 right-2 cursor-pointer',
        !selectedIds.has(id) && 'hidden group-hover:inline-block'
      )}
      checked={selectedIds.has(id)}
      onChange={onChange}
    />
  )
}
