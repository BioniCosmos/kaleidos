import type { ComponentChildren } from 'preact'

export default function FloatingMenu({
  children,
}: {
  children: ComponentChildren
}) {
  return (
    <div class="fixed bottom-4 right-4 md:bottom-6 md:right-6 flex flex-col gap-4">
      {children}
    </div>
  )
}
