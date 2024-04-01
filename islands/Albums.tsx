import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import Checkbox from '../components/Checkbox.tsx'
import FloatingMenu from '../components/FloatingMenu.tsx'
import Grid from '../components/Grid.tsx'
import SelectAllButton from '../components/SelectAllButton.tsx'
import SelectionCount from '../components/SelectionCount.tsx'
import type { Album } from '../db.ts'
import DeleteSelection from './DeleteSelection.tsx'
import NewAlbum from './NewAlbum.tsx'

export default function Albums({ albums }: { albums: Album[] }) {
  const [selectedIds, setSelectedIds] = useState(new Set<number>())
  const allSelected = selectedIds.size === albums.length

  function checkboxOnChange(id: number) {
    return (event: JSX.TargetedEvent<HTMLInputElement>) => {
      const next = new Set(selectedIds)
      if (event.currentTarget.checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      setSelectedIds(next)
    }
  }

  function buttonOnClick() {
    const next = !allSelected
      ? new Set(albums.map(({ id }) => id))
      : new Set<number>()
    setSelectedIds(next)
  }

  return (
    <>
      <Grid>
        {albums.map(({ id, name }) => (
          <a
            href={`/album/${id}`}
            class="relative group rounded-lg shadow bg-gray-100 hover:bg-gray-200 p-4 text-xl hover:scale-105 hover:shadow-lg transition dark:bg-zinc-800 dark:hover:bg-opacity-80 dark:hover:bg-zinc-800 dark:text-zinc-50 dark:text-opacity-60"
          >
            <Checkbox
              id={id}
              selectedIds={selectedIds}
              onChange={checkboxOnChange(id)}
            />
            {name}
          </a>
        ))}
      </Grid>
      <FloatingMenu>
        <SelectionCount selectedIds={selectedIds} />
        <SelectAllButton
          allSelected={allSelected}
          onClick={buttonOnClick}
          isNone={albums.length === 0}
        />
        {selectedIds.size > 0 ? (
          <DeleteSelection target="album" idSet={selectedIds} />
        ) : (
          <NewAlbum />
        )}
      </FloatingMenu>
    </>
  )
}
