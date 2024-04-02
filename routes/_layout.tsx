import { type PageProps } from '$fresh/server.ts'
import Icon from '../components/Icon.tsx'
import config from '../config.ts'
import Theme from '../islands/Theme.tsx'
import type { State } from './_middleware.ts'

export default function Layout({
  route,
  state,
  Component,
}: PageProps<unknown, Partial<State>>) {
  const { user } = state
  return (
    <>
      <header class="bg-gray-300 dark:bg-zinc-950 px-4 py-2 flex items-center justify-between dark:border-zinc-800 dark:border-b dark:text-zinc-50 dark:text-opacity-60">
        <a href="/" class="text-xl font-bold dark:text-zinc-50">
          {config.title}
        </a>
        {user !== undefined && (
          <div class="flex items-center gap-6">
            <Theme />
            <a href="/logout">
              <Icon name="log-out" />
            </a>
            <a href="/settings">
              <Icon name="settings" />
            </a>
            <div class="text-right">
              <h2 class="text-xl font-bold dark:text-zinc-50">{user.name}</h2>
              <h3 class="text-gray-500">{user.id}</h3>
            </div>
          </div>
        )}
      </header>
      <main
        class={
          route !== '/login' && route !== '/signup'
            ? 'p-4 pt-6'
            : 'h-[calc(100dvh_-_2.75rem)] flex items-center justify-center'
        }
      >
        <Component />
      </main>
    </>
  )
}
