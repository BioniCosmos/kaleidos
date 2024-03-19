import { useRef, useState } from 'preact/hooks'
import Dialog from '../components/Dialog.tsx'
import FloatButton from '../components/FloatButton.tsx'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'

export default function NewAlbum() {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  function submit() {
    formRef.current?.submit()
  }

  return (
    <>
      <FloatButton
        label="New album"
        iconName="plus"
        onClick={() => setOpen(true)}
      />
      <Dialog
        open={open}
        title="New album"
        close={() => setOpen(false)}
        onClickConfirm={submit}
      >
        <Form method="post" action="/album" ref={formRef}>
          <Input label="Name" name="name" required />
        </Form>
      </Dialog>
    </>
  )
}
