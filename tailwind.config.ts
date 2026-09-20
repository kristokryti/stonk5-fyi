import type { Config } from "tailwindcss";

// Aurora design system. The canonical tokens (CSS custom properties) and
// base components (.glass, .btn, .chip, .bar, .tabs, grids, etc.) live in
// design-reference/aurora-tokens.css, copied into app/aurora.css and
// imported globally from the root layout — that file is the single source
// of truth for color values. These Tailwind colors mirror the same hex
// values 1:1, for the handful of places components need a Tailwind utility
// (spacing/layout) alongside an aurora.css class rather than an inline style.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#060913",
        ink: "#F2F5FF",
        ink2: "#AEB7D2",
        mute: "#7C87A8",
        c1: "#38BDF8",
        c2: "#818CF8",
        c3: "#C084FC",
        pos: "#5EEAD4",
        neg: "#FB7185",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        card: "24px",
        "card-lg": "32px",
      },
      maxWidth: {
        wrap: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
