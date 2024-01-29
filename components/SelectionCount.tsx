export default function SelectionCount({
  selectedIds,
}: {
  selectedIds: Set<number>
}) {
  return selectedIds.size > 0 ? (
    <div class="text-center py-2 px-4 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition">
      {selectedIds.size} selected
    </div>
  ) : null
}
