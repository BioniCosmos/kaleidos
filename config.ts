export interface Config {
  workingDir: string
  secret: string
}

export default {
  workingDir: Deno.cwd(),
  secret: 'secret',
} satisfies Config
