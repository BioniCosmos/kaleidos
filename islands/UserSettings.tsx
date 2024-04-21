import type { User } from '@db'
import ky, { type HTTPError } from 'ky'
import type { JSX } from 'preact'
import Button from '../components/Button.tsx'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'

export default function UserSettings({ user }: { user: User }) {
  const submit: JSX.SubmitEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) {
      return
    }
    const body = new FormData(form)
    body.set('id', user.id)
    await ky
      .put('/user', { body })
      .then(() => location.reload())
      .catch((error: HTTPError) =>
        error.response
          .text()
          .then((message) => location.assign(`/error?message=${message}`))
      )
  }
  return (
    <Form onSubmit={submit}>
      <Input label="Name" name="name" value={user.name} required />
      <Button>Save changes</Button>
    </Form>
  )
}
