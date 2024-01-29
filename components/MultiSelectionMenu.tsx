import type { ComponentChildren, JSX } from 'preact'
import DeleteSelection from '../islands/DeleteSelection.tsx'
import SelectAllButton from './SelectAllButton.tsx'
import SelectionCount from './SelectionCount.tsx'

export default function MultiSelectionMenu({
  selectedIds,
  allSelected,
  buttonOnClick,
  isNone,
  target,
  children,
}: {
  selectedIds: Set<number>
  allSelected: boolean
  buttonOnClick: JSX.MouseEventHandler<HTMLButtonElement>
  isNone: boolean
  target: Parameters<typeof DeleteSelection>[0]['target']
  children: ComponentChildren
}) {
  return (
    <>
      <SelectionCount selectedIds={selectedIds} />
      <SelectAllButton
        allSelected={allSelected}
        onClick={buttonOnClick}
        isNone={isNone}
      />
      {selectedIds.size > 0 ? (
        <DeleteSelection target={target} selectedIds={selectedIds} />
      ) : (
        children
      )}
    </>
  )
}
