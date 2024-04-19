import type { DB } from 'sqlite'
import { GenerateVariants } from '../islands/GenerateVariants.tsx'
import UserManager from '../islands/UserManager.tsx'
import { getSettings, type User } from '../lib/db.ts'
import Button from './Button.tsx'
import Form from './Form.tsx'
import SelectMenu from './SelectMenu.tsx'

export default function AdminSettings({ db }: { db: DB }) {
  const options = ['Enable', 'Disable'].map((name) => ({
    value: name.toLowerCase(),
    name,
  }))
  const settings = getSettings(db)
  const settingItems = (
    [
      {
        label: 'Signup',
        name: 'signup',
      },
      {
        label: 'Format images when uploading',
        name: 'formatPreprocess',
      },
      {
        label: 'Generate thumbnails when uploading',
        name: 'thumbnailPreprocess',
      },
    ] as const
  ).map((item) => (
    <SelectMenu
      {...item}
      options={options}
      defaultValue={settings[item.name]}
    />
  ))
  const users = db.queryEntries<User>('SELECT * FROM users')
  return (
    <>
      <Form method="post" action="/settings/admin">
        {settingItems}
        <Button>Save changes</Button>
      </Form>
      <hr />
      <GenerateVariants />
      <hr />
      <UserManager users={users} />
    </>
  )
}
