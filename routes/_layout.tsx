import { type PageProps } from '$fresh/server.ts'
import Icon from '../components/Icon.tsx'
import config from '../config.ts'
import type { State } from './_middleware.ts'

export default function Layout({
  route,
  state,
  Component,
}: PageProps<unknown, Partial<State>>) {
  const { user } = state
  return (
    <>
      <header class="bg-gray-300 px-4 py-2 flex items-center justify-between">
        <a href="/" class="text-xl font-bold">
          {config.title}
        </a>
        {user !== undefined && (
          <div class="flex items-center gap-6">
            <a href="/logout">
              <Icon name="log-out" />
            </a>
            <a href="/settings">
              <Icon name="settings" />
            </a>
            <div class="text-right">
              <h2 class="text-xl font-bold">{user.name}</h2>
              <h3 class="text-gray-500">{user.id}</h3>
            </div>
          </div>
        )}
      </header>
      <main
        class={
          route !== '/login'
            ? 'p-4 pt-6'
            : 'h-[calc(100dvh_-_2.75rem)] flex items-center justify-center'
        }
      >
        <Component />
      </main>
    </>
  )
}
