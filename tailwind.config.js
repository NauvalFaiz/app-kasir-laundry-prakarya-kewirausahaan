/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b02228',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fca5a5',
          300: '#f87171',
          400: '#ef4444',
          500: '#b02228',
          600: '#9a1d22',
          700: '#7f171c',
          800: '#661317',
          900: '#4d0e11',
        },
        dark: {
          DEFAULT: '#3b4b50',
          50: '#f0f4f5',
          100: '#d9e3e6',
          200: '#b3c7cc',
          300: '#8da9b2', // Tambahan 300
          400: '#678c99', // Tambahan 400 (ini yang tadi error)
          500: '#3b4b50',
          600: '#2f3d41',
          700: '#232e32',
          800: '#171f22',
          900: '#0c1013',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(176, 34, 40, 0.15)',
        'card': '0 4px 24px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
