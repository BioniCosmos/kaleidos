import { type Handlers } from '$fresh/server.ts'
import { verify } from 'argon2'
import Button from '../components/Button.tsx'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'
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
    <Form method="post" class="bg-white p-8 rounded shadow">
      <Input label="Id" name="id" required />
      <Input label="Password" type="password" name="password" required />
      <Button>Login</Button>
    </Form>
  )
}
