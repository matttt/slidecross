/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      'white': '#F0F4EF',
      'black': '#0D1821',
      'green': '#8BD69E',
      'blue': '#B4CDED'
    },
  },
  plugins: [require('tailwindcss-safe-area')],
}