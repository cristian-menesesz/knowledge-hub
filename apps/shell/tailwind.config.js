/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('../../packages/design-system/tailwind.config.ts')],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/design-system/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
