/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lfc: {
          red: '#C8102E', // brand red — lit top of the hero gradients
          'red-dark': '#8C0A20', // hover states, gradient midpoint
          maroon: '#4A0714', // card / raised surface
          'maroon-dark': '#2E050F', // app background
          'maroon-deep': '#1E0309', // bottom nav, sits under the background
          yellow: '#F6EB61', // primary accent
          'yellow-dark': '#C9BE3F',
          teal: '#00B2A9', // secondary accent
        },
        // Result colours, named so W/D/L reads the same everywhere it appears.
        // Note a loss is grey rather than red: red is the surface here, so a red
        // chip would read as brand furniture instead of a result.
        result: {
          win: '#00B2A9',
          draw: '#C9CDD2',
          loss: '#8A8F96',
        },
        // Errors can't reuse result.loss (grey reads as a drawn match, not a
        // failure) and can't be brand red on a red surface, so they get their
        // own light tint that stays legible on the maroon.
        danger: '#FF8B8B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
