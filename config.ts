export interface Config {
  workingDir: string
  secret: string
  title: string
}

export default {
  workingDir: Deno.cwd(),
  secret: 'secret',
  title: 'Kaleidos',
} satisfies Config
