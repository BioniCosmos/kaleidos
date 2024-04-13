import { ensureFile } from '$std/fs/mod.ts'
import sharp, { type Metadata } from 'sharp'
import type { Format } from './ImagePath.ts'
import { ImagePath, formats } from './ImagePath.ts'
import type { InMessage, OutMessage } from './workers/image.ts'

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

export function processImages(inMessage: InMessage[]) {
  const worker = new Worker(import.meta.resolve('./workers/image.ts'), {
    type: 'module',
  })
  worker.postMessage(inMessage)
  return new Promise<OutMessage[]>((resolve) => {
    const handler = (
      event: MessageEvent<OutMessage[] | { total: number; completed: number }>
    ) => {
      const message = event.data
      if ('total' in message) {
        const event = new CustomEvent('progress', { detail: message })
        dispatchEvent(event)
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
