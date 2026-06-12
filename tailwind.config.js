/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', 'sans-serif'],
        work: ['"Noto Sans TC"', 'sans-serif'],
        fira: ['"Fira Sans"', 'sans-serif'],
      },
    }
  },
  plugins: []
}
