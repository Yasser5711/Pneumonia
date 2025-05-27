/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  safelist: [
    'bg-red-500', // Add for testing
    'text-white', // Add for testing
    'p-8', // Add for testing
    'text-3xl', // Add for testing
    'font-bold', // Add for testing
    'group-hover:opacity-100',
    'group-hover:blur-sm',
    'group-hover:scale-105',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        text: 'var(--color-text)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
