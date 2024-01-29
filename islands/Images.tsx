import { join } from '$std/path/mod.ts'
import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import Checkbox from '../components/Checkbox.tsx'
import FloatingMenu from '../components/FloatingMenu.tsx'
import MultiSelectionMenu from '../components/MultiSelectionMenu.tsx'
import type { Image } from '../db.ts'
import UploadImage from './UploadImage.tsx'

export default function Images({
  images,
  albumId,
}: {
  images: Image[]
  albumId: number
}) {
  const [selectedIds, setSelectedIds] = useState(new Set<number>())
  const allSelected = selectedIds.size === images.length

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
      ? new Set(images.map(({ id }) => id!))
      : new Set<number>()
    setSelectedIds(next)
  }

  return (
    <>
      <div class="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-4 pb-4">
        {images.map(({ id: _id, path }) => {
          const id = _id!
          return (
            <a href={`/image/${id}`} class="relative group">
              <img
                src={join('/images', path)}
                loading="lazy"
                class="w-full h-48 object-cover hover:scale-105 transition rounded shadow hover:shadow-lg"
              />
              <Checkbox
                id={id}
                selectedIds={selectedIds}
                onChange={checkboxOnChange(id)}
              />
            </a>
          )
        })}
      </div>
      <FloatingMenu>
        <MultiSelectionMenu
          selectedIds={selectedIds}
          allSelected={allSelected}
          buttonOnClick={buttonOnClick}
          isNone={images.length === 0}
          target="image"
        >
          <UploadImage albumId={albumId} />
        </MultiSelectionMenu>
      </FloatingMenu>
    </>
  )
}
