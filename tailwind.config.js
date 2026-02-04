/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#f8f8fa',
          100: '#f0f0f6',
          200: '#e1e1ed',
          300: '#d2d2e4',
          400: '#b3b3d1',
          500: '#9494be',
          600: '#7575ab',
          700: '#565698',
          800: '#373785',
          900: '#0c0c0e',
        },
      },
      fontFamily: {
        jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
};
