import sharp from 'sharp'
import {
  getNormalSize,
  type ImageOptions,
  type SharpInput,
} from '../process-image.ts'

export interface InMessage {
  input: SharpInput
  variants: {
    output: string
    options?: ImageOptions
  }[]
}

export interface OutMessage {
  width: number
  height: number
  variants: {
    file: string
    tmpFile: string
  }[]
}

addEventListener('message', async (event) => {
  const messages: InMessage[] = event.data
  const outMessages = messages.map(async ({ input, variants }) => {
    const origin = sharp(input)
    const metadata = await origin.metadata()
    const { width, height } = getNormalSize(metadata)

    origin
      .keepIccProfile()
      .withExif({})
      .withMetadata({ orientation: metadata.orientation })

    const outVariants = variants.map(async ({ output, options }) => {
      let image = origin.clone()
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

      const tmpFile = await Deno.makeTempFile()
      await image.toFile(tmpFile)
      return { file: output, tmpFile }
    })

    return { width, height, variants: await Promise.all(outVariants) }
  })

  const counter = { total: outMessages.length, completed: 0 }
  const withCounter = outMessages.map(async (message) => {
    await message
    counter.completed++
    postMessage(counter)
    return message
  })
  postMessage(await Promise.all(withCounter))

  close()
})
