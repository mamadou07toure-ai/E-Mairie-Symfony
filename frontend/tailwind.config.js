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
        'mairie-blue': { DEFAULT: '#0F2D6B', dark: '#0a1e4a', light: '#1e4ba3' },
        'mairie-cyan': { DEFAULT: '#00B4D8', dark: '#0077b6', light: '#90e0ef' },
        'mairie-bg': '#F8FAFC',
        'status-pending':  { bg: '#F1F5F9', text: '#64748B' },
        'status-progress': { bg: '#EFF6FF', text: '#1D4ED8' },
        'status-missing':  { bg: '#FFF7ED', text: '#C2410C' },
        'status-valid':    { bg: '#F0FDF4', text: '#15803D' },
        'status-rejected': { bg: '#FEF2F2', text: '#B91C1C' },
      },
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(0,0,0,0.05)',
        'premium': '0 10px 15px -3px rgba(15,45,107,0.1), 0 4px 6px -2px rgba(15,45,107,0.05)',
      }
    },
  },
  plugins: [],
}
