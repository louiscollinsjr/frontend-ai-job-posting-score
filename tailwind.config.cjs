
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        indigo: {
          50: '#f0f5ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a4bcfc',
          400: '#8098f9',
          500: '#6373f1',
          600: '#4f54e8',
          700: '#4042cf',
          800: '#3636a7',
          900: '#303484',
          950: '#1d1e4b',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
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
  plugins: [],
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