import { join, parse } from '$std/path/mod.ts'
import {
  SignJWT,
  jwtVerify as verify,
} from 'https://deno.land/x/jose@v5.2.0/index.ts'
import ShortUniqueId from 'https://esm.sh/short-unique-id@5.0.3'
import type { User } from './db.ts'

export function redirect(path: string) {
  return new Response(null, {
    status: 303,
    headers: { Location: encodeURI(path) },
  })
}

const secret = new TextEncoder().encode(
  'Eternal-Commotion6-Willed-Blurred-Unlikable'
)

export async function jwtSign(user: User) {
  const date = new Date()
  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ typ: 'JWT', alg: 'HS256' })
    .setExpirationTime(date.setDate(date.getDate() + 1))
    .sign(secret)
  return token
}

export async function jwtVerify(token: string) {
  try {
    const {
      payload: { sub },
    } = await verify(token, secret)
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

export function parseFileName(fileName: string) {
  const { name, ext } = parse(fileName)
  return { base: name, ext: ext.slice(1) }
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

export function getPath(fileName: string, { year, month, day } = getTime()) {
  return join(year, month, day, fileName)
}

export function fileNameWithSuffix(fileName: string) {
  const { base, ext } = parseFileName(fileName)
  return `${base}-${randomId()}.${ext}`
}

export const randomId = new ShortUniqueId({ length: 10 }).randomUUID

export function deleteContent(target: 'album' | 'image', value: unknown) {
  return () =>
    fetch(`/${target}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(value),
    }).then((value) => location.assign(value.url))
}
