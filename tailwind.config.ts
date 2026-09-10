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
        ink: "hsl(var(--ink))",
        paper: "hsl(var(--paper))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        pop: "hsl(var(--pop))",
        muted: "hsl(var(--muted))",
        line: "hsl(var(--line))",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderWidth: {
        3: "3px",
      },
      keyframes: {
        "count-pop": {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "40%": { transform: "scale(1.15)", opacity: "1" },
          "70%": { transform: "scale(0.96)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        flash: {
          "0%": { opacity: "0" },
          "8%": { opacity: "0.95" },
          "100%": { opacity: "0" },
        },
        "strip-drop": {
          "0%": { transform: "translateY(-32px) rotate(-2deg)", opacity: "0" },
          "60%": { transform: "translateY(6px) rotate(1deg)", opacity: "1" },
          "100%": { transform: "translateY(0) rotate(0)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "count-pop": "count-pop 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        flash: "flash 0.5s ease-out forwards",
        "strip-drop": "strip-drop 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
