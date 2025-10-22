/** @type {import('tailwindcss').Config} */

const { fontFamily } = require("tailwindcss/defaultTheme");
const containerQueries = require('@tailwindcss/container-queries');
const forms = require('@tailwindcss/forms');
const typography = require('@tailwindcss/typography');

module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      animation: {
        blob1: 'blob1 5s ease-in-out infinite',
        blob2: 'blob2 6s ease-in-out infinite',
        blob3: 'blob3 7s ease-in-out infinite',
      },
      keyframes: {
        blob1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(80px, -60px) scale(1.3)' },
        },
        blob2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-60px, 80px) scale(1.25)' },
        },
        blob3: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(60px, 40px) scale(1.28)' },
        },
      },
      fontFamily: {
        sans: ['Aeonik', ...fontFamily.sans],
        aeonik: ['Aeonik', 'sans-serif'],
        playfair: ['"Playfair Display Variable"', 'serif'],
        roboto: ['"Roboto Variable"', 'sans-serif'],
        quicksand: ['"Quicksand Variable"', 'sans-serif'],
        geist: ['"Geist Variable"', 'sans-serif']
      },
      maxWidth: {
        '7xl': '80rem',   // 1280px (default)
        '8xl': '90rem',   // 1440px
        '9xl': '100rem',  // 1600px
        '10xl': '120rem', // 1920px
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
          '3xl': '1728px',
          '4xl': '1920px',
        },
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)'
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)'
        }
      },
      spacing: {
        '128': '32rem',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '2rem',
      },
    },
  },
  plugins: [typography, forms, containerQueries],
}

// // tailwind.config.ts
// import type { Config } from 'tailwindcss';

// export default {
//   content: [
//     './src/**/*.{html,js,svelte,ts}',
//   ],
//   theme: {
//     extend: {
//       colors: {
//         indigo: {
//           50: '#f0f5ff',
//           100: '#e0eaff',
//           200: '#c7d7fe',
//           300: '#a4bcfc',
//           400: '#8098f9',
//           500: '#6373f1',
//           600: '#4f54e8',
//           700: '#4042cf',
//           800: '#3636a7',
//           900: '#303484',
//           950: '#1d1e4b',
//         }
//       },
//       fontFamily: {
//         sans: ['Inter', 'system-ui', 'sans-serif'],
//         display: ['Poppins', 'system-ui', 'sans-serif'],
//       },
//       spacing: {
//         '128': '32rem',
//       },
//       boxShadow: {
//         'subtle': '0 2px 10px rgba(0, 0, 0, 0.05)',
//       },
//       borderRadius: {
//         'xl': '1rem',
//         '2xl': '2rem',
//       },
//     },
//   },
//   plugins: [],
// } satisfies Config;