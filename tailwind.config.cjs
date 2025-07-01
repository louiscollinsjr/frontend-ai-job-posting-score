/** @type {import('tailwindcss').Config} */


module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
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
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
        playfair: ['Playfair Display Variable', 'Playfair Display', 'system-ui', 'serif'],
        roboto: ['Roboto Variable', 'Roboto', 'system-ui', 'sans-serif'],
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