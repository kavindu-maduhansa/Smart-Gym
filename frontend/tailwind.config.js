/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        black: "#EFF6FF",
        orange: {
          DEFAULT: "#3B82F6",
          dark: "#2563EB",
        },
        blue: {
          DEFAULT: "#3B82F6",
          light: "#DBEAFE",
          dark: "#2563EB",
        },
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
