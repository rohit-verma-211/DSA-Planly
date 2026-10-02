/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'] },
      colors: {
        page: '#0b0b0c',
        card: '#111113',
        line: '#232326',
        ink: { DEFAULT: '#ececee', dim: '#9a9aa2', faint: '#62626a' },
        accent: '#f5b83d',
      },
    },
  },
  plugins: [],
};
