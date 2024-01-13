import { dirname, fromFileUrl, join } from '$std/path/mod.ts'
import './wasm_exec.js'

declare class Go {
  importObject: WebAssembly.Imports
  run(instance: WebAssembly.Instance): void
}

const go = new Go()
const wasmPath = join(dirname(fromFileUrl(import.meta.url)), 'argon2.wasm')
const { instance } = await WebAssembly.instantiate(
  Deno.readFileSync(wasmPath),
  go.importObject
)
go.run(instance)

declare global {
  interface Window {
    hash(password: string): string
    verify(password: string, hash: string): string
  }
}

export const hash = window.hash
export const verify = window.verify
