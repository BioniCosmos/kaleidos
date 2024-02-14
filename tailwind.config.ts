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
      },
      animation: {
        pop: 'pop 3s forwards',
      },
    },
  },
} satisfies Config
