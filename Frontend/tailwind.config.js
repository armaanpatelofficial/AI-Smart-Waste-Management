/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4CAF50',
        'primary-dark': '#388E3C',
        'primary-light': '#81C784',
        'bg-main': '#f8f9fa',
        'gov-blue': '#1a3c5e',
        'gov-orange': '#FF6B35',
      },
      fontFamily: {
        baloo: ['"Baloo 2"', 'cursive'],
        dm: ['"DM Sans"', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0,0,0,0.06)',
        'green': '0 4px 20px rgba(76,175,80,0.3)',
        'orange': '0 4px 20px rgba(255,107,53,0.3)',
      }
    },
  },
  plugins: [],
}
