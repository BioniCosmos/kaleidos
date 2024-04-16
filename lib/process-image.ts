import { ensureFile } from '$std/fs/mod.ts'
import sharp, { type Metadata } from 'sharp'
import type { DB } from 'sqlite'
import type {
  InMessage as ProcessIn,
  OutMessage as ProcessOut,
} from '../workers/process-images.ts'
import type { InMessage as SaveIn } from '../workers/save-images.ts'
import type { Format } from './ImagePath.ts'
import { ImagePath, formats } from './ImagePath.ts'
import type { UploadEvent } from './UploadEvent.ts'
import { getSettings } from './db.ts'
import { getTime } from './utils.ts'

export type SharpInput =
  | ArrayBuffer
  | Uint8Array
  | Uint8ClampedArray
  | Int8Array
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | Float32Array
  | Float64Array
  | string

export type ImageOptions = { format?: Format | null; isThumbnail?: boolean }

export function processImages(
  inMessage: ProcessIn[],
  uploadEvent: UploadEvent
) {
  const worker = new Worker(
    import.meta.resolve('./workers/process-images.ts'),
    { type: 'module' }
  )
  worker.postMessage(inMessage)
  return new Promise<ProcessOut[]>((resolve) => {
    const handler = (
      event: MessageEvent<ProcessOut[] | { total: number; completed: number }>
    ) => {
      const message = event.data
      if ('total' in message) {
        uploadEvent.dispatchEvent('progress', message)
      } else {
        resolve(message)
        worker.removeEventListener('message', handler)
      }
    }
    worker.addEventListener('message', handler)
  })
}

export async function getMetadata(input: SharpInput) {
  const origin = sharp(input)
  const metadata = await origin.metadata()
  return getNormalSize(metadata)
}

export async function processImage(
  input: SharpInput,
  output: string,
  options?: ImageOptions
) {
  let image = sharp(input)
  const metadata = await image.metadata()
  const { width, height } = getNormalSize(metadata)

  image
    .keepIccProfile()
    .withExif({})
    .withMetadata({ orientation: metadata.orientation })

  if (options !== undefined) {
    const { isThumbnail, format } = options
    if (isThumbnail) {
      image = image.resize({
        withoutEnlargement: true,
        [width > height ? 'width' : 'height']: 512,
      })
    }
    if (format !== undefined && format !== null) {
      image = image.toFormat(format)
    }
  }

  await ensureFile(output)
  await image.toFile(output)
}

export function getNormalSize({ width, height, orientation }: Metadata) {
  width = width!
  height = height!
  return (orientation ?? 0) >= 5
    ? { width: height, height: width }
    : { width, height }
}

export function prepareFormatVariants(pathOrImagePath: string | ImagePath) {
  const imagePath =
    typeof pathOrImagePath === 'string'
      ? new ImagePath(pathOrImagePath)
      : pathOrImagePath
  return formats.map((format) => ({
    output: imagePath.converted(format),
    options: { format },
  }))
}

export function prepareThumbnailVariants(pathOrImagePath: string | ImagePath) {
  const imagePath =
    typeof pathOrImagePath === 'string'
      ? new ImagePath(pathOrImagePath)
      : pathOrImagePath
  return [...formats, null].map((format) => ({
    output: imagePath.thumbnail(format),
    options: { format, isThumbnail: true },
  }))
}

export async function uploadImages(
  db: DB,
  imageFiles: File[],
  albumId: number,
  uploadEvent: UploadEvent
) {
  const { process, save } = await Promise.all(
    imageFiles.map((imageFile) => prepareUploadImage(db, imageFile))
  ).then((prepared) => ({
    process: prepared.map((process) => process.processParams),
    save: prepared.map((process) => process.saveParams),
  }))
  const processOuts = await processImages(process, uploadEvent)

  const saveIn: SaveIn = {
    albumId,
    images: save.map((saveParams, i) => {
      const { width, height, variants } = processOuts[i]
      return { metadata: { ...saveParams, width, height }, variants }
    }),
  }
  const worker = new Worker(import.meta.resolve('./workers/save-images.ts'), {
    type: 'module',
  })
  worker.postMessage(saveIn)
  worker.addEventListener(
    'message',
    (event) => uploadEvent.dispatchEvent('redirect', event.data),
    { once: true }
  )
}

async function prepareUploadImage(db: DB, imageFile: File) {
  const time = getTime()
  const imagePath = await ImagePath.from(imageFile, time)

  const name = imagePath.originalName
  const ext = imagePath.ext
  const date = time.time
  const path = imagePath.toString()
  const size = imageFile.size

  const input = await imageFile.arrayBuffer()

  const { formatPreprocess, thumbnailPreprocess } = getSettings(db)
  const formatVariants =
    formatPreprocess === 'enable' ? prepareFormatVariants(imagePath) : []
  const thumbnailVariants =
    thumbnailPreprocess === 'enable' ? prepareThumbnailVariants(imagePath) : []
  const variants = [
    { output: imagePath.raw },
    ...formatVariants,
    ...thumbnailVariants,
  ]

  return {
    processParams: { input, variants },
    saveParams: { name, ext, date, path, size },
  }
}
