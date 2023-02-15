/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Note the addition of the `app` directory.
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',

    // Or if using `src` directory:
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: Object.assign(
      { ...defaultTheme.fontFamily },
      {
        'major-mono': ['Major Mono Display', 'monospace'],
        'readex-pro': ['Readex Pro', 'icomoon', 'emoji', 'sans-serif'],
      }
    ),
    extend: {},
  },
  plugins: [],
}
