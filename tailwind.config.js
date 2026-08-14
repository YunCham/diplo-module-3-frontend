/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          deepest: '#023D54',
          deep: '#035B7A',
          DEFAULT: '#047BA0',
          light: '#059BC6',
          lighter: '#06BBEC',
        },
        gold: {
          dark: '#7A5229',
          DEFAULT: '#9A6735',
          light: '#BA7C41',
          lighter: '#DAA15A',
        },
        mint: {
          dark: '#6BCE82',
          DEFAULT: '#94DEA5',
          light: '#B4E9C1',
          lighter: '#D4F4DD',
        },
      },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
