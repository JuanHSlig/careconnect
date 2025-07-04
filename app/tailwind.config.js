module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  darkMode: 'class', // Activar modo oscuro por clase
  theme: {
    extend: {
      colors: {
        vibePurple: {
          light: '#a18cd1',
          DEFAULT: '#6a11cb',
          dark: '#3a0ca3',
        },
        vibeBlue: {
          light: '#89f7fe',
          DEFAULT: '#43e97b',
          dark: '#38b6ff',
        },
        vibePink: {
          light: '#fbc2eb',
          DEFAULT: '#fd6e6a',
          dark: '#ff0080',
        },
      },
      fontFamily: {
        vibe: [
          'Inter',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        modalIn: 'modalIn 0.2s ease-out',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
