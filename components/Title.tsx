import { Head } from '$fresh/runtime.ts'
import config from '../config.ts'

export default function Title({ children }: { children: string }) {
  return (
    <Head>
      <title>
        {children} | {config.title}
      </title>
    </Head>
  )
}
