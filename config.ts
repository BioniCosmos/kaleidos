export interface Config {
  workingDir: string
  title: string
}

export default {
  workingDir: Deno.cwd(),
  title: 'Kaleidos',
} satisfies Config
