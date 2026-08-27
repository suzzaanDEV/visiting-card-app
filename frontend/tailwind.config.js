/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-primary)',
          primaryHover: 'var(--color-primary-hover)',
          secondary: 'var(--color-secondary)',
          secondaryHover: 'var(--color-secondary-hover)',
          accent: 'var(--color-accent)',
          accentHover: 'var(--color-accent-hover)',
          background: 'var(--color-background)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text)',
          textMuted: 'var(--color-text-muted)',
          border: 'var(--color-border)',
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
        'secondary-gradient': 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-primary) 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        'light-gradient': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      },
    },
  },
  plugins: [],
}