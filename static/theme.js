/**
 * @param {boolean} isDark
 */
const setDarkMode = (isDark) =>
  document.documentElement.classList.toggle('dark', isDark)

const media = matchMedia('(prefers-color-scheme: dark)')
const theme = localStorage.getItem('theme')
const isDark = (theme === null && media.matches) || theme === 'dark'
setDarkMode(isDark)

media.addEventListener('change', (event) => {
  if (localStorage.getItem('theme') !== null) {
    return
  }
  setDarkMode(event.matches)
})
