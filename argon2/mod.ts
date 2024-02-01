import { join } from '$std/path/mod.ts'
import './wasm_exec.js'

declare class Go {
  importObject: WebAssembly.Imports
  run(instance: WebAssembly.Instance): void
}

const go = new Go()
const wasmPath = join(import.meta.dirname!, 'argon2.wasm')
const { instance } = await WebAssembly.instantiate(
  Deno.readFileSync(wasmPath),
  go.importObject
)
go.run(instance)

declare global {
  function hash(password: string): string
  function verify(password: string, hash: string): string
}

export const hash = globalThis.hash
export const verify = globalThis.verify
