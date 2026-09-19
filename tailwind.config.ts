import type { Config } from "tailwindcss";

// Palette lifted from stonk5.com's own page source (theme-color meta +
// inline hex values), not invented: navy for surfaces, orange as the
// brand CTA color, teal as the secondary/positive accent.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#F7FAFD",
          100: "#EEF4FB",
          150: "#E7EEF7",
          200: "#E6F1FB",
          300: "#D6E2F0",
          400: "#AFC2DA",
          500: "#3C577A",
          600: "#314A69",
          700: "#2D4560",
          800: "#243851",
          900: "#1B2C42",
          950: "#131F30",
        },
        accent: {
          light: "#FBEDE8",
          tint: "#F4A78D",
          DEFAULT: "#FF8A4C",
          hover: "#D9480F",
          deep: "#A8442C",
        },
        teal: {
          light: "#9CE3FC",
          DEFAULT: "#6CD2F8",
          soft: "#6DD3BE",
          strong: "#1187CE",
          deep: "#1B6E62",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
