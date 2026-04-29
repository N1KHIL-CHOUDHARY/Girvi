export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4faf5',
          100: '#e8f7ef',
          200: '#cde8db',
          300: '#99d6bb',
          400: '#5eb690',
          500: '#0f766e',
          600: '#0d6a61',
          700: '#105850',
          800: '#134741',
          900: '#0e342e',
        },
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};