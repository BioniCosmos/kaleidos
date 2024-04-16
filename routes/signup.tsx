import { defineRoute, type Handlers } from '$fresh/server.ts'
import { hash } from 'argon2'
import Button from '../components/Button.tsx'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'
import Title from '../components/Title.tsx'
import { getSettings, type User } from '../lib/db.ts'
import { redirect } from '../lib/utils.ts'
import { State } from './_middleware.ts'

export const handler: Handlers<unknown, State> = {
  async POST(req, ctx) {
    const { db } = ctx.state
    if (getSettings(db).signup === 'disable') {
      return redirect('/error?message=Signup disabled')
    }

    const formData = await req.formData()
    const id = formData.get('id') as string
    const password = hash(formData.get('password') as string)
    const users = db.queryEntries<User>('SELECT * FROM users WHERE id = :id', {
      id,
    })
    if (users.length !== 0) {
      return redirect('/error?message=Id exists')
    }

    db.queryEntries(
      `INSERT INTO users (id, password, name) VALUES (:id, :password, '')`,
      { id, password }
    )
    return redirect('/login')
  },
}

export default defineRoute<State>((_req, ctx) => {
  const { db } = ctx.state
  if (getSettings(db).signup === 'disable') {
    return redirect('/error?message=Signup disabled')
  }
  return (
    <>
      <Title>Signup</Title>
      <Form
        method="post"
        class="bg-white p-8 rounded shadow dark:bg-zinc-950 dark:border-zinc-800 dark:border"
      >
        <Input label="Id" name="id" required />
        <Input label="Password" type="password" name="password" required />
        <Button>Sign up</Button>
      </Form>
    </>
  )
})
