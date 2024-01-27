import feather, {
  type FeatherAttributes,
  type FeatherIconNames,
} from 'https://esm.sh/feather-icons@4.29.1'

export default function Icon({
  name,
  options,
}: {
  name: FeatherIconNames
  options?: Partial<FeatherAttributes>
}) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: feather.icons[name].toSvg(options) }}
    />
  )
}
