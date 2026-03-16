/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#2D5016',
          accent: '#4A7D26',
          brown: '#8B7355',
        },
      },
    },
  },
  plugins: [],
}
