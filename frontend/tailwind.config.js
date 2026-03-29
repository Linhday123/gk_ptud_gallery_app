/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Be Vietnam Pro", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 14px 34px rgba(15, 23, 42, 0.08)",
      },
    },
  },
  plugins: [],
};
