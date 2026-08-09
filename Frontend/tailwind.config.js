/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#050B14',
          deep: '#030812',
        },
        card: {
          DEFAULT: '#0B1422',
          hover: '#0F1B2E',
          border: '#1A2740',
        },
        primary: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#6D28D9',
          glow: '#7C3AED',
        },
        secondary: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        slate: {
          950: '#040711',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(139, 92, 246, 0.45)',
        'glow-sm': '0 0 20px -6px rgba(139, 92, 246, 0.5)',
        card: '0 4px 24px -8px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        blink: {
          '0%, 80%, 100%': { opacity: 0.2 },
          '40%': { opacity: 1 },
        },
        drift: {
          '0%': { transform: 'translate(0,0) rotate(0deg)' },
          '50%': { transform: 'translate(20px,-30px) rotate(8deg)' },
          '100%': { transform: 'translate(0,0) rotate(0deg)' },
        },
        pulseGlow: {
          '0%,100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out both',
        fadeInUp: 'fadeInUp 0.5s ease-out both',
        slideIn: 'slideIn 0.3s ease-out both',
        blink1: 'blink 1.4s infinite ease-in-out both',
        drift: 'drift 12s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
