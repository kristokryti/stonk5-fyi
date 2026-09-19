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
          400: "#93A8CC",
          500: "#5B739E",
          600: "#34497A",
          700: "#23345A",
          800: "#16213A",
          900: "#101B30",
          950: "#0B1524",
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
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        // ponsfamily.com's own dark mode is flat -- solid near-black
        // surfaces with a thin border, not the glossy "float" shadow
        // their light mode uses. Matching that: minimal, not glowing.
        card: "0 1px 2px 0 rgb(0 0 0 / 0.4)",
        pill: "0 1px 2px 0 rgb(0 0 0 / 0.4), 0 0 0 1px rgb(56 189 248 / 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
