import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-amiri)', 'Georgia', 'serif'],
        arabic:  ['var(--font-amiri)', 'Scheherazade New', 'serif'],
      },
      colors: {
        islam: {
          500: '#1a7f4b',
          600: '#15803d',
          700: '#166534',
        },
        gold: {
          400: '#fbbf24',
          500: '#d4af37',
          600: '#a67c00',
        },
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'pulse-green':  'pulseGreen 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0', transform: 'translateY(6px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:    { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseGreen: { '0%,100%': { boxShadow: '0 0 8px rgba(26,127,75,0.3)' }, '50%': { boxShadow: '0 0 20px rgba(26,127,75,0.6)' } },
      },
    },
  },
  plugins: [],
}

export default config
