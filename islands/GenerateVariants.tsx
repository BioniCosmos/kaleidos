import ky from 'https://esm.sh/ky@1.2.3'
import { useState } from 'preact/hooks'
import Form from '../components/Form.tsx'
import ProgressButton from '../components/ProgressButton.tsx'
import type { UploadEventMap } from '../lib/UploadEvent.ts'
import { getProgress } from '../lib/utils.ts'

export function GenerateVariants() {
  const init = '0%' as const
  const [progress, setProgress] = useState({ format: init, thumbnail: init })
  const submit = (operation: 'format' | 'thumbnail') => async () => {
    const id = await ky
      .post('/settings/convert', { json: { operation } })
      .text()
    const es = new EventSource(`/image/progress/${id}`)
    es.addEventListener('progress', ({ data }) => {
      const processProgress: UploadEventMap['progress'] = JSON.parse(data)
      setProgress((prev) => ({
        ...prev,
        [operation]: getProgress(processProgress),
      }))
      if (processProgress.completed === processProgress.total) {
        es.close()
        setTimeout(
          () => setProgress((prev) => ({ ...prev, [operation]: init })),
          1500
        )
      }
    })
  }
  return (
    <Form>
      <ProgressButton
        type="button"
        progress={progress.format}
        onClick={submit('format')}
      >
        Generate images of other formats
      </ProgressButton>
      <ProgressButton
        type="button"
        progress={progress.thumbnail}
        onClick={submit('thumbnail')}
      >
        Generate all thumbnails
      </ProgressButton>
    </Form>
  )
}
