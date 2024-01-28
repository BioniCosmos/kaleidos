import { type Handlers } from '$fresh/server.ts'
import { verify } from 'argon2'
import { db, type User } from '../db.ts'
import { jwtSign, redirect } from '../utils.ts'

export const handler: Handlers = {
  async POST(req) {
    const loginInfo = await req.formData()
    const id = loginInfo.get('id') as string
    const password = loginInfo.get('password') as string

    const user = db
      .queryEntries<User>('SELECT * FROM users WHERE id = :id', { id })
      .at(0)

    if (user === undefined) {
      return redirect('/error?message=User not found')
    }

    if (!verify(password, user.password)) {
      return redirect('/error?message=Wrong password')
    }

    const res = redirect('/')
    res.headers.set(
      'Set-Cookie',
      `token=${await jwtSign(user)}; Max-Age=${24 * 60 * 60}`
    )
    return res
  },
}

export default function Login() {
  return (
    <form
      method="post"
      class="bg-white p-8 rounded shadow grid grid-cols-1 gap-6"
    >
      <label class="block">
        <span class="text-gray-700">Id</span>
        <input
          name="id"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </label>
      <label class="block">
        <span class="text-gray-700">Password</span>
        <input
          type="password"
          name="password"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </label>
      <button class="py-2 px-4 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-700 transition">
        Login
      </button>
    </form>
  )
}
