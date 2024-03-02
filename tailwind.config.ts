import forms from '@tailwindcss/forms'
import { type Config } from 'tailwindcss'

export default {
  content: ['{routes,islands,components}/**/*.{ts,tsx}'],
  plugins: [forms],
  theme: {
    extend: {
      keyframes: {
        pop: {
          '75%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        open: {
          '0%': { opacity: '0', transform: 'scale(.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        close: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(.95)' },
        },
      },
      animation: {
        pop: 'pop 3s forwards',
        open: 'open 100ms ease-out forwards',
        close: 'close 75ms ease-in forwards',
      },
    },
  },
  darkMode: 'selector',
} satisfies Config
