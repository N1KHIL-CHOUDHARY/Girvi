/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Essential for the ThemeToggle to work
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Keeping your custom brand palette
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
        // Added for the subtle, premium look
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        // Inter is great, but ensure you have it imported in your CSS
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Added monospace for the labels/monospaced design elements
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};