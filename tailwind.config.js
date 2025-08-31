/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'glow-blue': '0 0 12px 2px rgba(59, 130, 246, 0.4)',
        'glow-green': '0 0 12px 2px rgba(34, 197, 94, 0.4)',
        'glow-red': '0 0 12px 2px rgba(239, 68, 68, 0.4)',
        'glow-orange': '0 0 12px 2px rgba(249, 115, 22, 0.4)',
        'glow-white': '0 0 12px 2px rgba(255, 255, 255, 0.4)',
      }
    },
  },
  plugins: [],
}
