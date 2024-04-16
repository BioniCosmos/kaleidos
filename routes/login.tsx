import { type Handlers } from '$fresh/server.ts'
import { verify } from 'argon2'
import Button from '../components/Button.tsx'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'
import Title from '../components/Title.tsx'
import { type User } from '../lib/db.ts'
import { jwtSign, redirect } from '../lib/utils.ts'
import type { State } from './_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const loginInfo = await req.formData()
    const id = loginInfo.get('id') as string
    const password = loginInfo.get('password') as string

    const { db } = ctx.state
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
    <>
      <Title>Login</Title>
      <Form
        method="post"
        class="bg-white p-8 rounded shadow dark:bg-zinc-950 dark:border-zinc-800 dark:border"
      >
        <Input label="Id" name="id" required />
        <Input label="Password" type="password" name="password" required />
        <Button>Login</Button>
      </Form>
    </>
  )
}
