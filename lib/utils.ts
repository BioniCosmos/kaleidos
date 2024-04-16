import {
  SignJWT,
  jwtVerify as verify,
} from 'https://deno.land/x/jose@v5.2.0/index.ts'
import ShortUniqueId from 'https://esm.sh/short-unique-id@5.0.3'
import { useRef } from 'preact/hooks'
import type { User } from './db.ts'

export function redirect(path: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: encodeURI(path) },
  })
}

let _secret: Uint8Array | undefined
const secret = async () => {
  if (_secret === undefined) {
    const config = (await import('../config.ts')).default
    _secret = new TextEncoder().encode(config.secret)
  }
  return _secret
}

export async function jwtSign(user: User) {
  const date = new Date()
  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ typ: 'JWT', alg: 'HS256' })
    .setExpirationTime(date.setDate(date.getDate() + 1))
    .sign(await secret())
  return token
}

export async function jwtVerify(token: string) {
  try {
    const {
      payload: { sub },
    } = await verify(token, await secret())
    if (sub === undefined) {
      return null
    }
    return sub
  } catch {
    return null
  }
}

export function getToken(cookie: string) {
  return cookie
    .split('; ')
    .map((item) => item.split('='))
    .find(([key]) => key === 'token')
    ?.at(1)
}

export function verifyToken(cookie: string | null) {
  if (cookie === null) {
    return Promise.resolve(null)
  }

  const token = getToken(cookie)
  if (token === undefined) {
    return Promise.resolve(null)
  }

  return jwtVerify(token)
}

export interface Timestamp {
  year: string
  month: string
  day: string
  time: number
}

export function getTime(date = new Date()): Timestamp {
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const time = date.getTime()
  return { year, month, day, time }
}

export const randomId = new ShortUniqueId().randomUUID

export function sendJSON(
  target: 'album' | 'image',
  method: string,
  value: unknown
) {
  return () =>
    fetch(`/${target}`, {
      method,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(value),
    }).then((value) => location.assign(value.url))
}

export function setToArray<T>(set: Set<T>) {
  return Array.from(set.values())
}

// References:
// https://github.com/Tinkerforge/esp32-firmware/blob/d5f5c2e760dacaff7804304e7655982be779498d/software/web/src/ts/util.ts#L599
// https://jser.dev/2023-04-25-how-does-useid-work/
let _id = 0
export function useId() {
  return useRef(`KRI-${_id++}`).current
}
