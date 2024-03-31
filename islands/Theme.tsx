import { clsx } from 'clsx'
import { useEffect, useState } from 'preact/hooks'
import type { JSX } from 'preact/jsx-runtime'
import Icon from '../components/Icon.tsx'

export default function Theme() {
  const [open, setOpen] = useState(false)
  const [animation, setAnimation] = useState('')
  const [icon, setIcon] = useState<'sun' | 'moon' | null>(null)

  const options = ['System', 'Light', 'Dark'] as const
  type Option = (typeof options)[number]

  function openMenu() {
    setAnimation('open')
    setOpen(true)
  }

  function closeMenu() {
    setAnimation('close')
    setTimeout(() => {
      setOpen(false)
    }, 100)
  }

  function setTheme(event: JSX.TargetedMouseEvent<HTMLButtonElement>) {
    const option = event.currentTarget.innerText as Option
    switch (option) {
      case 'System':
        localStorage.removeItem('theme')
        setDarkMode(media.matches)
        setIcon(media.matches ? 'moon' : 'sun')
        break
      case 'Light':
        localStorage.setItem('theme', 'light')
        setDarkMode(false)
        setIcon('sun')
        break
      case 'Dark':
        localStorage.setItem('theme', 'dark')
        setDarkMode(true)
        setIcon('moon')
        break
    }

    dispatchEvent(new Event('storage'))
    closeMenu()
  }

  useEffect(() => {
    setIcon(
      document.documentElement.classList.contains('dark') ? 'moon' : 'sun'
    )

    const toggle = (event: MediaQueryListEvent) => {
      if (localStorage.getItem('theme') !== null) {
        return
      }
      setIcon(event.matches ? 'moon' : 'sun')
    }

    media.addEventListener('change', toggle)
    return media.removeEventListener('change', toggle)
  }, [])

  return (
    <div class="relative h-6">
      <button onClick={openMenu}>
        {icon !== null && <Icon name={icon} />}
      </button>
      {open && (
        <>
          <div
            class="fixed top-0 left-0 h-screen w-screen z-40"
            onClick={closeMenu}
          />
          <div
            class={clsx(
              'absolute -left-2 mt-2 w-32 rounded-md bg-white shadow-lg z-50 origin-top-left',
              animation === 'open' ? 'animate-open' : 'animate-close',
              'dark:bg-zinc-950 dark:border-zinc-800 dark:border'
            )}
          >
            {options.map((option) => (
              <div class="p-1">
                <button
                  class="w-full rounded-md p-2 text-sm hover:bg-gray-200 dark:hover:bg-zinc-800 dark:text-zinc-50 transition text-start"
                  onClick={setTheme}
                >
                  {option}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

declare const setDarkMode: (isDark: boolean) => boolean
declare const media: MediaQueryList
