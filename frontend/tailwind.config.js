/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0056b3",
        primaryDark: "#003d82",
        secondary: "#61dafb",
        darkBg: "#282c34",
      },
    },
  },
  plugins: [],
}

