import { type PageProps } from '$fresh/server.ts'

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Kaleidos</title>
        <link rel="icon" href="/favicon.png" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body class="bg-gray-50">
        <Component />
      </body>
    </html>
  )
}
