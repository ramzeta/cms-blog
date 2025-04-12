/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Crimson Pro', 'Georgia', 'serif'],
        display: ['Playfair Display', 'serif'],
      },
      colors: {
        paper: '#FFF8E7',
        ink: '#2C1810',
        primary: '#8B4513',
        secondary: '#A0522D',
        border: '#D4C5B9',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#2C1810',
            fontFamily: 'Crimson Pro, Georgia, serif',
            fontSize: '1.125rem',
            lineHeight: '1.8',
            p: {
              marginBottom: '1.5rem',
              textAlign: 'justify',
            },
            h1: {
              fontFamily: 'Playfair Display, serif',
              color: '#2C1810',
              fontWeight: '700',
            },
            h2: {
              fontFamily: 'Playfair Display, serif',
              color: '#2C1810',
              fontWeight: '700',
            },
            h3: {
              fontFamily: 'Playfair Display, serif',
              color: '#2C1810',
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};