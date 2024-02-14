import type { PageProps } from '$fresh/server.ts'
import Button from '../../components/Button.tsx'
import Form from '../../components/Form.tsx'
import Input from '../../components/Input.tsx'
import type { State } from '../_middleware.ts'

export default function Settings({ state }: PageProps<unknown, State>) {
  const { name } = state.user
  return (
    <div class="space-y-8 max-w-3xl mx-auto">
      <Form method="post" action="/settings/profile">
        <Input label="Name" name="name" value={name} required />
        <Button>Save changes</Button>
      </Form>
      <hr />
      <Form method="post" action="/settings/password">
        <Input
          label="Current password"
          type="password"
          name="currentPassword"
          required
        />
        <Input
          label="New password"
          type="password"
          name="newPassword"
          required
        />
        <Input
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          required
        />
        <Button>Save changes</Button>
      </Form>
    </div>
  )
}
