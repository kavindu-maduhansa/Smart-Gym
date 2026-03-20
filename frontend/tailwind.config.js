/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        orange: {
          DEFAULT: "#ff7f11",
          dark: "#ff6600",
        },
        blue: {
          DEFAULT: "#0074d9",
          light: "#1e90ff",
          dark: "#00244d",
        },
        white: "#ffffff",
      },
    },
  },
  plugins: [],
};
