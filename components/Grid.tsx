import type { ComponentChildren } from 'preact'

export default function Grid({ children }: { children: ComponentChildren }) {
  return (
    <div class="grid grid-cols-[repeat(auto-fill,_minmax(250px,_1fr))] gap-4 pb-4">
      {children}
    </div>
  )
}
