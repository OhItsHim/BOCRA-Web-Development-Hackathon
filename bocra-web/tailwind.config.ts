import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
        body: ['system-ui', 'sans-serif'],
      },
      colors: {
        telecoms: '#1565C0',
        broadcast: '#F9A825',
        internet: '#2E7D32',
        postal: '#B71C1C',
        accent: '#4FC3F7',
      },
    },
  },
  plugins: [],
} satisfies Config
