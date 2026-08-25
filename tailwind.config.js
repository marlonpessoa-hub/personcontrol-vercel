/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#00d4aa',
          hover: '#00f5c4',
          active: '#00b894',
          on: '#000000',
        },
        danger: {
          DEFAULT: '#ff6b6b',
          hover: '#ff8787',
        },
      },
      fontFamily: {
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
