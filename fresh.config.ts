import tailwind from '$fresh/plugins/tailwind.ts'
import { defineConfig } from '$fresh/server.ts'

export default defineConfig({
  plugins: [tailwind()],
  router: {
    ignoreFilePattern: /_common.ts/,
  },
})
