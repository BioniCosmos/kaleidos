import type { FeatherIconNames } from 'feather-icons'
import type { JSX } from 'preact'
import Button from './Button.tsx'
import Icon from './Icon.tsx'

interface Props {
  label: string
  color?: 'blue' | 'red'
  iconName: FeatherIconNames
  onClick: JSX.HTMLAttributes<HTMLButtonElement>['onClick']
}

export default function FloatButton({
  label,
  color,
  iconName,
  onClick,
}: Props) {
  return (
    <Button
      color={color}
      class="flex gap-3 items-center justify-center"
      onClick={onClick}
    >
      <Icon
        name={iconName}
        options={{ width: 18, height: 18, 'stroke-width': 3 }}
      />
      <div>{label}</div>
    </Button>
  )
}
