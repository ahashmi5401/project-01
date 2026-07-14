/**
 * DESIGN SYSTEM TOKENS
 * 
 * SPACING SCALE (4px base grid):
 * - xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px, 2xl: 32px, 3xl: 48px, 4xl: 64px
 * 
 * ELEVATION SYSTEM (dark navy palette compatible):
 * - sm: subtle depth for cards
 * - md: standard depth for modals
 * - lg: prominent depth for dropdowns
 * - xl: maximum depth for overlays
 * 
 * TYPE SCALE:
 * - display: 48px/56px bold
 * - h1: 36px/44px bold
 * - h2: 28px/36px semibold
 * - h3: 20px/28px semibold
 * - body: 16px/24px normal
 * - caption: 14px/20px normal
 * - label: 12px/16px medium uppercase tracking-wider
 * 
 * BUTTON SYSTEM:
 * - primary: accent background, offwhite text
 * - secondary: hairline border, offwhite text
 * - ghost: steelblue text, no border
 */

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
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "48px",
        "4xl": "64px",
      },
      boxShadow: {
        "elevation-sm": "0 1px 2px rgba(0, 0, 0, 0.3), 0 0 1px rgba(232, 98, 44, 0.1)",
        "elevation-md": "0 4px 6px rgba(0, 0, 0, 0.4), 0 0 2px rgba(232, 98, 44, 0.15)",
        "elevation-lg": "0 10px 15px rgba(0, 0, 0, 0.5), 0 0 4px rgba(232, 98, 44, 0.2)",
        "elevation-xl": "0 20px 25px rgba(0, 0, 0, 0.6), 0 0 8px rgba(232, 98, 44, 0.25)",
      },
      fontSize: {
        display: ["48px", { lineHeight: "56px", fontWeight: "bold" }],
        h1: ["36px", { lineHeight: "44px", fontWeight: "bold" }],
        h2: ["28px", { lineHeight: "36px", fontWeight: "semibold" }],
        h3: ["20px", { lineHeight: "28px", fontWeight: "semibold" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "normal" }],
        caption: ["14px", { lineHeight: "20px", fontWeight: "normal" }],
        label: ["12px", { lineHeight: "16px", fontWeight: "medium", letterSpacing: "0.05em", textTransform: "uppercase" }],
      },
    },
  },
  plugins: [],
};
