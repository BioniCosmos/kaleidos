import type { JSX } from 'preact'

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
    <button
      class="text-center py-2 px-4 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition"
      onClick={onClick}
    >
      {!allSelected ? 'Select all' : 'Clear selection'}
    </button>
  ) : null
}
