import type { DB } from 'sqlite'
import { getSettings } from '../db.ts'
import Button from './Button.tsx'
import Form from './Form.tsx'
import SelectMenu from './SelectMenu.tsx'

export default function AdminSettings({ db }: { db: DB }) {
  const options = ['Enable', 'Disable'].map((name) => ({
    value: name.toLowerCase(),
    name,
  }))
  const { signup } = getSettings(db)
  return (
    <Form method="post" action="/settings/admin">
      <SelectMenu
        label="Signup"
        name="signup"
        options={options}
        defaultValue={signup}
      />
      <Button>Save changes</Button>
    </Form>
  )
}
