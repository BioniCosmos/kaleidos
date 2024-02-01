import type { JSX } from 'preact'
import Button from './Button.tsx'

export default function SelectAllButton({
  allSelected,
  onClick,
  isNone,
}: {
  allSelected: boolean
  onClick: JSX.MouseEventHandler<HTMLButtonElement>
  isNone: boolean
}) {
  return !isNone ? (
    <Button onClick={onClick}>
      {!allSelected ? 'Select all' : 'Clear selection'}
    </Button>
  ) : null
}
