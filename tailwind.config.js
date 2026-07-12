/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        navy: {
          DEFAULT: "#0F2A47",
        },
        offwhite: {
          DEFAULT: "#F4F8FB",
        },
        steelblue: {
          DEFAULT: "#9DB4CB",
        },
        accent: {
          DEFAULT: "#E8622C",
        },
      },
      borderColor: {
        hairline: "rgba(255,255,255,0.15)",
      },
    },
  },
  plugins: [],
};
