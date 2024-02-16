import { useState } from 'preact/hooks'
import { randomId } from '../utils.ts'
import Icon from './Icon.tsx'

export default function Toast({ toastIds }: { toastIds: string[] }) {
  return (
    <div class="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xs space-y-4">
      {toastIds.map((id) => (
        <div
          key={id}
          // dark:text-gray-400 dark:bg-gray-800
          class="animate-pop flex items-center p-4 text-gray-500 bg-white rounded-lg shadow"
          role="alert"
        >
          {/* dark:bg-green-800 dark:text-green-200 */}
          <div class="inline-flex items-center justify-center flex-shrink-0 size-8 text-green-500 bg-green-100 rounded-lg">
            <Icon name="check" />
          </div>
          <div class="ms-3 text-sm font-normal">Copied!</div>
        </div>
      ))}
    </div>
  )
}

export function useToast(): [string[], () => void] {
  const [toastIds, setToastIds] = useState<string[]>([])
  const id = randomId()

  function addToast() {
    setToastIds([id, ...toastIds])
    setTimeout(() => {
      setToastIds((prev) => prev.filter((toastId) => toastId !== id))
    }, 3000)
  }

  return [toastIds, addToast]
}
