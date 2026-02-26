import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // Support mode sombre
  darkMode: 'class',

  theme: {
    extend: {
      // Polices islamiques
      fontFamily: {
        // Police principale de l'app (interface)
        sans: ['var(--font-amiri)', 'Georgia', 'serif'],
        // Police coranique — chargée en local (KFGQPC ou Amiri selon dispo)
        quran: ['var(--font-amiri)', 'Scheherazade New', 'serif'],
        // Police UI latine
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },

      // Palette islamique
      colors: {
        // Vert islamique principal
        islam: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#1a7f4b', // Vert principal
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        // Or islamique
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#c9a227', // Or principal
          600: '#a67c00',
        },
        // Fond crème (lecture)
        cream: {
          50:  '#fefdf8',
          100: '#fdf8ed',
          200: '#f9f0d3',
        },
      },

      // Tailles de police pour le texte arabe (min 16px obligatoire)
      fontSize: {
        'arabic-sm':  ['1rem', { lineHeight: '2rem' }],     // 16px min
        'arabic-md':  ['1.5rem', { lineHeight: '2.5rem' }], // 24px défaut
        'arabic-lg':  ['2rem', { lineHeight: '3rem' }],     // 32px
        'arabic-xl':  ['2.5rem', { lineHeight: '3.5rem' }], // 40px
        'arabic-2xl': ['3rem', { lineHeight: '4rem' }],     // 48px
      },

      // Animations douces
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },

  plugins: [],
}

export default config
