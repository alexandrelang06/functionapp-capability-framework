/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2dd5ff',
        secondary: '#6c0dac',
        gray: { 
          DEFAULT: '#484f52',
          light: '#94a3b8'
        },
        white: '#ffffff'
      },
      fontFamily: {
        bree: ['Bree Serif', 'serif'],
        din: ['DIN', 'sans-serif'],
      },
    },
  },
  plugins: [],
};