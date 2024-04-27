import type { User } from '@db'
import { clsx } from 'clsx'
import ky, { type HTTPError } from 'ky'
import { useRef, useState } from 'preact/hooks'
import Button from '../components/Button.tsx'
import Dialog from '../components/Dialog.tsx'
import Form from '../components/Form.tsx'
import Icon from '../components/Icon.tsx'
import Input from '../components/Input.tsx'
import SelectMenu from '../components/SelectMenu.tsx'

interface Props {
  users: User[]
}

export default function UserManager({ users }: Props) {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const hasUser = user !== null
  const methodRef = useRef('')
  const formRef = useRef<HTMLFormElement>(null)
  const options = [
    { value: 'false', name: 'No' },
    { value: 'true', name: 'Yes' },
  ]
  const submit = () => {
    const form = formRef.current!
    if (methodRef.current !== 'DELETE' && !form.reportValidity()) {
      return false
    }
    const body = new FormData(form)
    if (body.get('password') === '') {
      body.delete('password')
    }
    return ky('/user', { method: methodRef.current, body })
      .then(() => location.reload())
      .catch((error: HTTPError) =>
        error.response
          .text()
          .then((message) => location.assign(`/error?message=${message}`))
      )
  }
  const create = () => {
    methodRef.current = 'POST'
    setOpen(true)
  }
  const edit = (user: User) => () => {
    methodRef.current = 'PUT'
    setUser(user)
    setOpen(true)
  }
  const deleteSubmit = async () => {
    methodRef.current = 'DELETE'
    await submit()
    setOpen(false)
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
          {users.map((user) => (
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-6 py-4">{user.id}</td>
              <td class="px-6 py-4">{user.name}</td>
              <td class="px-6 py-4">
                <Icon name={user.isAdmin ? 'check' : 'x'} />
              </td>
              <td class="px-6 py-4 divide-x-2 divide-black">
                <button
                  class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                  onClick={edit(user)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button class="w-full" onClick={create}>
        Create user
      </Button>
      <Dialog
        open={open}
        close={() => setOpen(false)}
        title="Editing the user"
        onClickConfirm={submit}
        cleanup={setUser.bind(null, null)}
      >
        <Form ref={formRef}>
          <div class={clsx({ hidden: hasUser })}>
            <Input label="Id" name="id" defaultValue={user?.id} required />
          </div>
          <Input label="Name" name="name" defaultValue={user?.name} />
          <Input
            label="Password"
            name="password"
            type="password"
            required={!hasUser}
          />
          <SelectMenu
            label="Admin"
            name="isAdmin"
            options={options}
            defaultValue={user?.isAdmin.toString()}
            required
          />
          {hasUser && (
            <button
              type="button"
              class="text-red-700 hover:text-white border border-red-500 hover:bg-red-500 font-medium text-sm rounded-lg px-4 py-1.5 text-center transition"
              onClick={deleteSubmit}
            >
              Delete
            </button>
          )}
        </Form>
      </Dialog>
    </>
  )
}
