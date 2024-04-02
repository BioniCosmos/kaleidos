import type { PageProps } from '$fresh/server.ts'
import AdminSettings from '../../components/AdminSettings.tsx'
import Button from '../../components/Button.tsx'
import Form from '../../components/Form.tsx'
import Input from '../../components/Input.tsx'
import Title from '../../components/Title.tsx'
import type { State } from '../_middleware.ts'

export default function Settings({ state }: PageProps<unknown, State>) {
  const { user, db } = state
  const { name, isAdmin } = user
  return (
    <>
      <Title>Settings</Title>
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
        {isAdmin && (
          <>
            <hr />
            <AdminSettings db={db} />
          </>
        )}
      </div>
    </>
  )
}
