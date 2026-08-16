/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef4fb',
          100: '#d6e3f3',
          200: '#a9c3e4',
          300: '#7ca3d4',
          400: '#4f83c4',
          500: '#2a63a7',
          600: '#1f4f8a',
          700: '#173b68',
          800: '#0f2849',
          900: '#0a1c33',
          950: '#061224',
        },
        medical: {
          DEFAULT: '#0F4C81',
          dark: '#0A345A',
        },
        emergency: '#DC2626',
        success: '#16A34A',
        warning: '#D97706',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,28,51,0.04), 0 1px 3px rgba(15,28,51,0.06)',
        pop: '0 8px 24px rgba(15,28,51,0.10)',
      },
    },
  },
  plugins: [],
};
