import type { PageProps } from '$fresh/server.ts'
import Title from '../components/Title.tsx'

export default function Error({ url }: PageProps) {
  return (
    <>
      <Title>Error</Title>
      <div class="dark:text-zinc-50">
        Error: {url.searchParams.get('message')}
      </div>
    </>
  )
}
