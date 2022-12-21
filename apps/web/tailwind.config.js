module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  corePlugins: {
    preflight: false,
  },
  // darkMode: false, // or 'media' or 'class'
  theme: {
    container: {
      center: true,
    },
    extend: {},
  },
  fontSize: {
    "9xl": "7.5rem",
  },
  variants: {
    extend: {},
  },
  plugins: [require("@tailwindcss/typography")],
};
