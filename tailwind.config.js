/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./impressum.html",
    "./datenschutz.html",
    "./partials/*.html",
    "./main.js",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#d4af37",
          dark: "#b8941f",
          light: "#e8c869",
        },
      },
      fontFamily: {
        display: ["Orbitron", "sans-serif"],
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
