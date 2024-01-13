import {
  SignJWT,
  jwtVerify as verify,
} from 'https://deno.land/x/jose@v5.2.0/index.ts'
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
  } catch (_error) {
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
