/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        handwriting: ['"Indie Flower"', 'cursive'],
      },
    },
  },
  plugins: [],
};
