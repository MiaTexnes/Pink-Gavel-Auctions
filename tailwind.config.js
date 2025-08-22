/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,cjs,mjs,ts,cts,mts}",
    "./*.html",
    "./src/**/*.html",
  ],
  darkMode: "class", // This is crucial for dark mode to work!
  theme: {},
  plugins: [],
};
