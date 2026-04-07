/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#05070D',
        'bg-secondary': '#0B0F19',
        'neon-blue': '#00F5FF',
        'neon-green': '#22FF88',
        'neon-red': '#FF3B3B',
        'neon-yellow': '#FFC857',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 245, 255, 0.8)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      backgroundImage: {
        'cyber-grid': `linear-gradient(rgba(0, 245, 255, 0.1) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(0, 245, 255, 0.1) 1px, transparent 1px)`,
      },
      backgroundSize: {
        'cyber-grid': '50px 50px',
      },
    },
  },
  plugins: [],
}
