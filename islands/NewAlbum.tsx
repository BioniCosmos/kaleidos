import { useState } from 'preact/hooks'
import Button from '../components/Button.tsx'
import Dialog from '../components/Dialog.tsx'
import Form from '../components/Form.tsx'
import Icon from '../components/Icon.tsx'
import Input from '../components/Input.tsx'

export default function NewAlbum() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        class="flex gap-3 items-center justify-center"
      >
        <Icon
          name="plus"
          options={{ width: 18, height: 18, 'stroke-width': 3 }}
        />
        <div>New album</div>
      </Button>
      <Dialog open={open}>
        <h2 class="text-2xl font-bold">New album</h2>
        <Form method="post" action="/album" class="mt-8">
          <Input label="Name" name="name" required />
          <div class="flex justify-center gap-2">
            <Button color="red" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button>Confirm</Button>
          </div>
        </Form>
      </Dialog>
    </>
  )
}
