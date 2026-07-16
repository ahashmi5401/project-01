/**
 * DESIGN SYSTEM TOKENS
 * 
 * SPACING SCALE (8px base grid):
 * - 0: 0px, 1: 4px, 2: 8px, 3: 12px, 4: 16px, 5: 20px, 6: 24px, 8: 32px, 10: 40px, 12: 48px, 16: 64px, 20: 80px, 24: 96px
 * 
 * BORDER RADIUS:
 * - none: 0px, sm: 4px, md: 8px, lg: 12px, xl: 16px, 2xl: 24px, full: 9999px
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
 * - h2: 30px/38px semibold
 * - h3: 24px/32px semibold
 * - h4: 20px/28px semibold
 * - body: 16px/24px normal
 * - small: 14px/20px normal
 * - caption: 12px/16px normal
 * - label: 12px/16px medium uppercase tracking-wider
 * 
 * BUTTON SIZES:
 * - sm: px-3 py-1.5 text-xs
 * - md: px-4 py-2 text-sm
 * - lg: px-6 py-3 text-base
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
        '0': '0px',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      boxShadow: {
        "elevation-sm": "0 1px 2px rgba(0, 0, 0, 0.3), 0 0 1px rgba(232, 98, 44, 0.1)",
        "elevation-md": "0 4px 6px rgba(0, 0, 0, 0.4), 0 0 2px rgba(232, 98, 44, 0.15)",
        "elevation-lg": "0 10px 15px rgba(0, 0, 0, 0.5), 0 0 4px rgba(232, 98, 44, 0.2)",
        "elevation-xl": "0 20px 25px rgba(0, 0, 0, 0.6), 0 0 8px rgba(232, 98, 44, 0.25)",
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      fontSize: {
        display: ["48px", { lineHeight: "56px", fontWeight: "bold" }],
        h1: ["36px", { lineHeight: "44px", fontWeight: "bold" }],
        h2: ["30px", { lineHeight: "38px", fontWeight: "semibold" }],
        h3: ["24px", { lineHeight: "32px", fontWeight: "semibold" }],
        h4: ["20px", { lineHeight: "28px", fontWeight: "semibold" }],
        body: ["16px", { lineHeight: "24px", fontWeight: "normal" }],
        small: ["14px", { lineHeight: "20px", fontWeight: "normal" }],
        caption: ["12px", { lineHeight: "16px", fontWeight: "normal" }],
        label: ["12px", { lineHeight: "16px", fontWeight: "medium", letterSpacing: "0.05em", textTransform: "uppercase" }],
      },
    },
  },
  plugins: [],
};
