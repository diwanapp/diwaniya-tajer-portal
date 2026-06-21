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
          500: "#2D526A",
          700: "#183B55",
          800: "#183B55",
          900: "#10263A",
          950: "#0B1B2A",
        },
        ivory: {
          50: "#FAF7F2",
          100: "#F5EFE3",
          200: "#E8DDC6",
        },
        sand: {
          200: "#D9C9A8",
          300: "#C8AD83",
          400: "#B79A72",
          500: "#8B6F5A",
        },
        gold: {
          400: "#C8AD83",
          500: "#B79A72",
          600: "#9C7E58",
          700: "#8B6F5A",
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
