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
        sage: {
          50: '#F4F7F5',
          100: '#E6ECE8',
          200: '#C9D8CE',
          300: '#A7C1B0',
          400: '#6B977D',
          500: '#3F7257',
          600: '#2D5943',
          700: '#234534',
          800: '#1B3B36', // Deep Forest Sage
          900: '#132B27',
          950: '#0E1F1C', // Dark Pine
        },
        sand: {
          50: '#FAF9F6', // Alabaster Canvas
          100: '#F5F3EC',
          200: '#EAE6DC',
          300: '#DBD5C5',
          400: '#BFB59B',
          500: '#9E9375',
          800: '#423C2C',
        },
        charcoal: {
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
