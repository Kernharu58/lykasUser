/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/globals.css",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2D6A4F",
        neutral: "#AAAAAA",
        white: "#FFFFFF",
        warnBrown: "#D08C60",
        darkBlue: "#1B2A49",
      },
    },
  },
  plugins: [],
};
