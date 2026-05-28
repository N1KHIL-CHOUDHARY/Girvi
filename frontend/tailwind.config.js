/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Essential for the ThemeToggle to work
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      
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