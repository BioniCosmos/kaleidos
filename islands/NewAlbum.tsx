import { useRef, useState } from 'preact/hooks'
import Button from '../components/Button.tsx'
import Dialog from '../components/Dialog.tsx'
import Form from '../components/Form.tsx'
import Icon from '../components/Icon.tsx'
import Input from '../components/Input.tsx'

export default function NewAlbum() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function submit() {
    formRef.current?.submit()
  }

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
      <Dialog
        open={open}
        title="New album"
        close={() => setOpen(false)}
        onConfirm={submit}
      >
        <Form method="post" action="/album" ref={formRef}>
          <Input label="Name" name="name" required />
        </Form>
      </Dialog>
    </>
  )
}
