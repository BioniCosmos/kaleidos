import Button from './Button.tsx'

export default function SelectionCount({
  selectedIds,
}: {
  selectedIds: Set<number>
}) {
  return selectedIds.size > 0 ? (
    <Button class="pointer-events-none">{selectedIds.size} selected</Button>
  ) : null
}
