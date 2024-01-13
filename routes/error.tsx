import type { PageProps } from '$fresh/server.ts'

export default function Error({ url }: PageProps) {
  return <>Error: {url.searchParams.get('message')}</>
}
