/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  safelist: [
    {
      pattern:
        /^(bg|border|text)-(red|blue|green|yellow|purple|pink|gray|indigo|teal|cyan|lime|emerald|rose|fuchsia|violet|amber|orange|stone|neutral|slate)-(100|200|300|400|500|600|700|800|900|950)$/,
      variants: ['hover', 'active']
    },
    {
      pattern:
        /^(p)-(0|1|2|3|4|5|6|7|8|9|10|11|12|14|16|20|24|28|32|36|40|44|48|52|56|60|64|72|80|96)$/
    }
  ],
  plugins: []
};
