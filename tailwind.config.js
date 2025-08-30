/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}", "./*.html"],
  theme: {
    extend: {},
  },
  plugins: [],
  darkMode: "class", // This is crucial for dark mode to work!
};
