import type { FeatherIconNames } from 'feather-icons'
import type { JSX } from 'preact'
import Icon from './Icon.tsx'

export default function InfoButton({
  label,
  iconName,
  onClick,
}: {
  label: string
  iconName: FeatherIconNames
  onClick?: JSX.HTMLAttributes<HTMLButtonElement>['onClick']
}) {
  return (
    <button
      class="flex gap-1 items-center hover:bg-gray-300 rounded-lg py-2 px-6 transition"
      onClick={onClick}
    >
      <Icon name={iconName} options={{ width: 18, height: 18 }} />
      <div>{label}</div>
    </button>
  )
}
