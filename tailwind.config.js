/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F9F5EF",
        beige: "#EBD8C3",
        brown: "#3B2F2F",
        softbrown: "#A66A4C",
        coral: "#D78A76",
        darkbrown: "#2A1F1F",
      },
      boxShadow: {
        retro: "0 6px 16px rgba(59,47,47,0.15)",
      },
      borderRadius: {
        '2xl': '1rem',
      }
    },
  },
  plugins: [],
};