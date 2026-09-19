import type { Config } from "tailwindcss";

// Navy/orange/teal lifted from stonk5.com's own page source (theme-color
// meta + inline hex values). "action" is a deliberate departure from their
// bright orange CTA — a restrained blue for buttons, per design feedback.
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
        action: {
          light: "#DBEAFE",
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          deep: "#1E3A8A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        // Layered elevation recipe measured off ponsfamily.com's "float"
        // cards, re-polarized for a dark surface (their shadows go dark
        // on white; ours go darker + a faint light rim on navy).
        card: "0 1px 2px 0 rgb(0 0 0 / 0.3), 0 8px 24px 0 rgb(0 0 0 / 0.35), 0 24px 48px 0 rgb(0 0 0 / 0.25), inset 0 1px 0 0 rgb(255 255 255 / 0.06)",
        pill: "0 1px 2px 0 rgb(0 0 0 / 0.3), 0 8px 24px 0 rgb(0 0 0 / 0.35), 0 20px 40px -8px rgb(37 99 235 / 0.45), inset 0 1px 0 0 rgb(255 255 255 / 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
