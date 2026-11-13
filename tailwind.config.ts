import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Neutral greys (no blue tint), with the shades the design uses exactly
        // (sampled from the Figma screenshots).
        gray: {
          ...colors.neutral,
          100: '#F2F2F2', // surfaces: gallery, rail buttons, cards, footer
          200: '#EBEBEB', // selected option fill, light borders
          900: '#292929', // primary text, rating bar fill
          950: '#141414', // filled buttons and badges
        },
        star: '#FFA439',
        'rating-track': '#E4E9EE',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 300ms ease-out',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
