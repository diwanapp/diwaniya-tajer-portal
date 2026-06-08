import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#EAF0F4",
          100: "#C9D6DF",
          500: "#395E74",
          700: "#2C5066",
          800: "#264558",
          900: "#1F3A4D",
          950: "#152836",
        },
        ivory: {
          50: "#F7F1E6",
          100: "#F1E9D9",
          200: "#E8DDC6",
        },
        sand: {
          200: "#D9C9A8",
          300: "#CDB98F",
          400: "#B89F7A",
          500: "#A48867",
        },
        gold: {
          400: "#D6B883",
          500: "#C9A86A",
          600: "#B08F4F",
          700: "#8E713D",
        },
        ink: {
          700: "#34485A",
          900: "#0F1F2A",
        },
        ok: "#5E8B6B",
        warn: "#C99A4B",
        err: "#A8514A",
      },
      fontFamily: {
        sans: ["IBM Plex Sans Arabic", "Tajawal", "ui-sans-serif", "system-ui", "sans-serif"],
        numeric: ["IBM Plex Sans Arabic", "Tajawal", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(15,31,42,0.04), 0 10px 28px -12px rgba(15,31,42,0.16)",
        glow: "0 24px 80px -40px rgba(201,168,106,0.55)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      backgroundImage: {
        "majlis-grain": "radial-gradient(rgba(201,168,106,0.10) 1px, transparent 1px), radial-gradient(rgba(201,168,106,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grain-2": "16px 16px, 32px 32px",
      },
    },
  },
  plugins: [],
};

export default config;
