import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import Form from '../components/Form.tsx'
import Input from '../components/Input.tsx'
import SelectMenu from '../components/SelectMenu.tsx'
import TextArea from '../components/TextArea.tsx'
import Toast, { useToast } from '../components/Toast.tsx'

export default function ImageLink({
  path,
  name,
}: {
  path: string
  name: string
}) {
  const [rawLink, setRawLink] = useState('')
  const [format, setFormat] = useState('not convert')
  const [toastIds, addToast] = useToast()

  const convertLink = `${rawLink}${
    format !== 'not convert' ? `?format=${format}` : ''
  }`

  useEffect(() => setRawLink(location.origin + path))

  const options = ['Not convert', 'WebP', 'AVIF'].map((option) => ({
    name: option,
    value: option.toLowerCase(),
  }))
  const htmlValue = `<picture>
  <source srcset="${rawLink}?format=avif" type="image/avif" />
  <source srcset="${rawLink}?format=webp" type="image/webp" />
  <img src="${rawLink}" alt="${name}" />
</picture>`

  async function copy(
    event: JSX.TargetedMouseEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const target = event.currentTarget
    target.focus()
    target.select()
    await navigator.clipboard.writeText(target.value)
    addToast()
  }

  return (
    <Form>
      <SelectMenu
        label="Convert to"
        options={options}
        value={format}
        onChange={(event) => setFormat(event.currentTarget.value)}
      />
      <Input
        label="Raw link"
        value={convertLink}
        class="font-mono"
        onClick={copy}
      />
      <Input
        label="Markdown"
        value={`![${name}](${convertLink})`}
        class="font-mono"
        onClick={copy}
      />
      <TextArea label="HTML" rows={5} class="font-mono" onClick={copy}>
        {htmlValue}
      </TextArea>
      <Toast toastIds={toastIds} />
    </Form>
  )
}
