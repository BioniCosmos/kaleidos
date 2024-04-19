import { useRef, useState } from 'preact/hooks'
import Button from '../components/Button.tsx'
import Dialog from '../components/Dialog.tsx'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'
import SelectMenu from '../components/SelectMenu.tsx'
import type { User } from '../lib/db.ts'

interface Props {
  users: User[]
}

export default function UserManager({ users }: Props) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const options = [
    { value: 0, name: 'No' },
    { value: 1, name: 'Yes' },
  ]
  const submit = () => {
    const form = formRef.current!
    return form.reportValidity() && form.submit()
  }
  return (
    <>
      <table class="w-full text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-gray-700 text-sm bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" class="px-6 py-3">
              Id
            </th>
            <th scope="col" class="px-6 py-3">
              Name
            </th>
            <th scope="col" class="px-6 py-3">
              Admin
            </th>
            <th scope="col" class="px-6 py-3">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map(({ id, name, isAdmin }) => (
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-6 py-4">{id}</td>
              <td class="px-6 py-4">{name}</td>
              <td class="px-6 py-4">{isAdmin}</td>{' '}
              <td class="px-6 py-4">
                <a
                  href="#"
                  class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button class="w-full" onClick={() => setOpen(true)}>
        Create user
      </Button>
      <Dialog
        open={open}
        close={() => setOpen(false)}
        title="Editing the user"
        onClickConfirm={submit}
      >
        <Form method="post" action="/user" ref={formRef}>
          <Input label="Id" name="id" required />
          <Input label="Name" name="name" required />
          <Input label="Password" name="password" required />
          <SelectMenu label="Admin" name="isAdmin" options={options} required />
        </Form>
      </Dialog>
    </>
  )
}
