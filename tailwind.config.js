/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#b46059',
        'brand-mint': '#d7e8db',
        'brand-rose': '#edc9c4',
        'brand-sand': '#f2e7d5',
        'text-main': '#1f1f1f',
      },
    },
  },
  plugins: [],
}
