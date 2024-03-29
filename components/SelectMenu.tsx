import type { JSX } from 'preact'

interface Props extends JSX.HTMLAttributes<HTMLSelectElement> {
  label: string
  options: {
    value: JSX.HTMLAttributes<HTMLOptionElement>['value']
    name?: JSX.HTMLAttributes<HTMLOptionElement>['children']
  }[]
}

export default function SelectMenu({ label, options, ...props }: Props) {
  return (
    <label class="block">
      <span class="text-gray-700 dark:text-zinc-50 dark:text-opacity-60">
        {label}
      </span>
      <select
        class="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-transparent dark:text-zinc-50 dark:focus:ring-0 dark:focus:border-gray-300 dark:border-opacity-40 dark:focus:border-opacity-100"
        {...props}
      >
        {options.map(({ value, name }) => (
          <option value={value}>{name ?? value}</option>
        ))}
      </select>
    </label>
  )
}
