import feather, {
  type FeatherAttributes,
  type FeatherIconNames,
} from 'feather-icons'

export default function Icon({
  name,
  options,
}: {
  name: FeatherIconNames
  options?: Partial<FeatherAttributes>
}) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: feather.icons[name].toSvg({
          ...options,
          class: 'mx-auto' + (options?.class ?? ''),
        }),
      }}
    />
  )
}
