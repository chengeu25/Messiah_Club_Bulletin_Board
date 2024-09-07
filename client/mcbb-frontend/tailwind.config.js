/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  safelist: [
    {
      pattern:
        /^(bg|border|text)-(red|blue|green|yellow|purple|pink|gray|indigo|teal|cyan|lime|emerald|rose|fuchsia|violet|amber|orange|stone|neutral)-(100|200|300|400|500|600|700|800|900|950)$/,
      variants: ['hover', 'active']
    }
  ],
  plugins: []
};
