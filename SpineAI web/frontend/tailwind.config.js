/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#EC4899',
        neon: {
          blue: '#00d9ff',
          cyan: '#0099ff',
          purple: '#6B00FF',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'neural-float': 'neural-float 6s ease-in-out infinite',
        'neural-pulse': 'neural-pulse 2s ease-in-out infinite',
        'particle-move': 'particle-move 20s linear infinite',
      },
      keyframes: {
        'neural-float': {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '0.5' },
          '50%': { transform: 'translate(20px, -20px)', opacity: '0.8' },
        },
        'neural-pulse': {
          '0%, 100%': { opacity: '0.3', r: '2' },
          '50%': { opacity: '0.8', r: '4' },
        },
        'particle-move': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100vw)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
