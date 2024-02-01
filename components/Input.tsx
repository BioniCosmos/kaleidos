import type { JSX } from 'preact'

interface Props extends JSX.HTMLAttributes<HTMLInputElement> {
  label: string
}

export default function Input({ label, ...props }: Props) {
  return (
    <label class="block">
      <span class="text-gray-700">{label}</span>
      <input
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        {...props}
      />
    </label>
  )
}
