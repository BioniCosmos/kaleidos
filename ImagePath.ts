import { exists } from '$std/fs/mod.ts'
import { join, parse, type ParsedPath } from '$std/path/mod.ts'
import config from './config.ts'
import type { Timestamp } from './utils.ts'
import { randomId } from './utils.ts'

export const formats = ['webp', 'avif'] as const
export type Format = (typeof formats)[number]

export class ImagePath {
  #path: string
  #parsedPath: ParsedPath
  #originalName: string | undefined

  constructor(path: string, originalName?: string) {
    this.#path = path
    this.#parsedPath = parse(path)
    this.#originalName = originalName
  }

  private withSuffix(suffix: string = randomId()) {
    return join(this.dir, `${this.name}-${suffix}.${this.ext}`)
  }

  toString() {
    return this.#path
  }

  static async from(imageFile: File, timestamp: Timestamp): Promise<ImagePath>
  static async from(imageName: string, timestamp: Timestamp): Promise<ImagePath>
  static async from(fileOrName: File | string, timestamp: Timestamp) {
    const name = typeof fileOrName === 'string' ? fileOrName : fileOrName.name
    const { year, month, day } = timestamp
    const path = join(year, month, day, name)

    const imagePath = new ImagePath(path)
    const needSuffix = await exists(imagePath.raw)
    return !needSuffix
      ? imagePath
      : new ImagePath(imagePath.withSuffix(), imagePath.name)
  }

  get name() {
    return this.#parsedPath.name
  }

  get ext() {
    return this.#parsedPath.ext.slice(1)
  }

  get dir() {
    return this.#parsedPath.dir
  }

  get base() {
    return this.#parsedPath.base
  }

  get raw() {
    return join(config.workingDir, 'images/raw/', this.#path)
  }

  get tmpDir() {
    return join(config.workingDir, '/images/tmp', this.dir)
  }

  get originalName() {
    return this.#originalName ?? this.name
  }

  thumbnail(format?: Format | null) {
    const convertExt =
      format !== undefined && format !== null ? `.${format}` : ''
    return join(this.tmpDir, `${this.name}.tn.${this.ext}${convertExt}`)
  }

  converted(format: Format) {
    return join(config.workingDir, 'images/tmp/', `${this.#path}.${format}`)
  }
}
