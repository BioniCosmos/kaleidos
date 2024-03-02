import { type PageProps } from '$fresh/server.ts'
import config from '../config.ts'

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{config.title}</title>
        <link rel="icon" href="/favicon.png" />
        <link rel="stylesheet" href="/styles.css" />
        <script src="/theme.js"></script>
      </head>
      <body class="bg-gray-50 dark:bg-zinc-950">
        <Component />
      </body>
    </html>
  )
}
