import { defineRoute } from '$fresh/server.ts'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'
import Title from '../components/Title.tsx'
import SignupSubmit from '../islands/SignupSubmit.tsx'
import { getSettings } from '../lib/db.ts'
import { redirect } from '../lib/utils.ts'
import { State } from './_middleware.ts'

export default defineRoute<State>((_req, ctx) => {
  const { db } = ctx.state
  if (getSettings(db).signup === 'disable') {
    return redirect('/error?message=Signup disabled')
  }
  return (
    <>
      <Title>Signup</Title>
      <Form class="bg-white p-8 rounded shadow dark:bg-zinc-950 dark:border-zinc-800 dark:border">
        <Input label="Id" name="id" required />
        <Input label="Password" type="password" name="password" required />
        <SignupSubmit />
        <div class="text-sm text-zinc-600">
          Already have an account?{' '}
          <a href="/login" class="text-blue-500 underline">
            Sign in
          </a>
        </div>
      </Form>
    </>
  )
})
