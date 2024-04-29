import { trpc } from '@trpc'
import type { JSX } from 'preact'
import Button from '../components/Button.tsx'

export default function SignupSubmit() {
  const submit: JSX.MouseEventHandler<HTMLButtonElement> = (event) => {
    const form = event.currentTarget.form!
    if (!form.reportValidity()) {
      return
    }
    trpc.user.create
      // @ts-ignore: validation by server
      .mutate(Object.fromEntries(new FormData(form).entries()))
      .then(() => location.replace('/login'))
      .catch((error: Error) =>
        location.assign(`/error?message=${error.message}`)
      )
  }
  return (
    <Button type="button" onClick={submit}>
      Sign up
    </Button>
  )
}
