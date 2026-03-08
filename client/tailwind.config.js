/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#b1b2ff",
          coral: "#ff6b6b",
          green: "#9de0ad",
          yellow: "#f48c25",
          dark: "#0a0a0a",
        },
      },
      borderRadius: {
        twelve: "12px",
      },
    },
  },
  plugins: [],
}