import { defineRoute, type Handlers } from '$fresh/server.ts'
import { repo } from '@db'
import { verify } from 'argon2'
import Button from '../components/Button.tsx'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'
import Title from '../components/Title.tsx'
import { getSettings } from '../lib/db.ts'
import { jwtSign, redirect } from '../lib/utils.ts'
import type { State } from './_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req) {
    const loginInfo = await req.formData()
    const id = loginInfo.get('id') as string
    const password = loginInfo.get('password') as string

    const user = repo.user.findUnique({ where: { id } })
    if (user === null) {
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

export default defineRoute<State>((_req, ctx) => {
  const { db } = ctx.state
  const allowSignup = getSettings(db).signup !== 'disable'
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
        {allowSignup && (
          <div class="text-sm text-zinc-600">
            Don’t have an account?{' '}
            <a href="/signup" class="text-blue-500 underline">
              Sign up
            </a>
          </div>
        )}
      </Form>
    </>
  )
})
