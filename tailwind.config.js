/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'rgb(var(--color-primary))',
          foreground: 'rgb(var(--color-primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent))',
          foreground: 'rgb(var(--color-accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Custom theme colors
        'theme-primary': 'rgb(var(--color-primary))',
        'theme-accent': 'rgb(var(--color-accent))',
        'theme-border': 'rgb(var(--color-border-accent))',
      },
      borderColor: {
        'theme': 'rgb(var(--color-border-accent))',
      },
      ringColor: {
        'theme': 'rgb(var(--color-ring))',
      },
      backgroundImage: {
        'theme-gradient': 'var(--color-gradient)',
      },
      boxShadow: {
        'glow-theme': '0 0 12px 2px rgba(var(--color-primary), 0.4)',
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
