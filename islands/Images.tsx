import { join } from '$std/path/mod.ts'
import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import Checkbox from '../components/Checkbox.tsx'
import Dialog from '../components/Dialog.tsx'
import FloatButton from '../components/FloatButton.tsx'
import FloatingMenu from '../components/FloatingMenu.tsx'
import Grid from '../components/Grid.tsx'
import SelectAllButton from '../components/SelectAllButton.tsx'
import SelectMenu from '../components/SelectMenu.tsx'
import SelectionCount from '../components/SelectionCount.tsx'
import type { Image } from '../db.ts'
import { sendJSON, setToArray } from '../utils.ts'
import DeleteSelection from './DeleteSelection.tsx'
import UploadImage from './UploadImage.tsx'

export default function Images({
  images,
  albumId,
  options,
}: {
  images: Image[]
  albumId: number
  options: Parameters<typeof SelectMenu>[0]['options']
}) {
  const [selectedIds, setSelectedIds] = useState(new Set<number>())
  const [open, setOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(albumId)
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
      ? new Set(images.map(({ id }) => id))
      : new Set<number>()
    setSelectedIds(next)
  }

  const moveToAlbum = sendJSON('image', 'PUT', {
    ids: setToArray(selectedIds),
    albumId: selectedAlbum,
  })

  function handleChangeSelect(event: JSX.TargetedEvent<HTMLSelectElement>) {
    setSelectedAlbum(Number(event.currentTarget.value))
  }

  return (
    <>
      <Grid>
        {images.map(({ id, path }) => (
          <a href={`/image/${id}`} class="relative group">
            <picture>
              <source
                srcset={join('/images', `${path}?thumbnail=true&format=avif`)}
                type="image/avif"
              />
              <source
                srcset={join('/images', `${path}?thumbnail=true&format=webp`)}
                type="image/webp"
              />
              <img
                src={join('/images', `${path}?thumbnail=true`)}
                loading="lazy"
                class="w-full h-48 object-cover hover:scale-105 transition rounded shadow hover:shadow-lg"
              />
            </picture>
            <Checkbox
              id={id}
              selectedIds={selectedIds}
              onChange={checkboxOnChange(id)}
            />
          </a>
        ))}
      </Grid>
      <FloatingMenu>
        <SelectionCount selectedIds={selectedIds} />
        <SelectAllButton
          allSelected={allSelected}
          onClick={buttonOnClick}
          isNone={images.length === 0}
        />
        {selectedIds.size > 0 ? (
          <div class="flex gap-2">
            <FloatButton
              label="Move"
              iconName="send"
              onClick={() => setOpen(true)}
            />
            <DeleteSelection target="image" selectedIds={selectedIds} />
          </div>
        ) : (
          <UploadImage albumId={albumId} />
        )}
      </FloatingMenu>
      <Dialog
        open={open}
        close={() => setOpen(false)}
        title="Move to album"
        onConfirm={moveToAlbum}
      >
        <SelectMenu
          label="Album"
          options={options}
          value={selectedAlbum}
          onChange={handleChangeSelect}
        />
      </Dialog>
    </>
  )
}
