import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-reactive tokens — values swap per [data-theme] in globals.css.
        paper: "rgb(var(--paper) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        accent2: "rgb(var(--accent2) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
      },
      fontFamily: {
        // Semantic, theme-reactive
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        // Concrete faces, for decoration that always wants a specific font
        archivo: ["var(--font-archivo)", "system-ui", "sans-serif"],
        "archivo-black": ["var(--font-archivo-black)", "system-ui", "sans-serif"],
        orbitron: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        "space-mono": ["var(--font-space-mono)", "monospace"],
        marker: ["var(--font-marker)", "cursive"],
        quicksand: ["var(--font-quicksand)", "system-ui", "sans-serif"],
        anton: ["var(--font-anton)", "system-ui", "sans-serif"],
        pixel: ["var(--font-press-start)", "monospace"],
        fredoka: ["var(--font-fredoka)", "system-ui", "sans-serif"],
        cairo: ["var(--font-cairo)", "system-ui", "sans-serif"],
      },
      borderWidth: { 3: "3px", 5: "5px" },
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
        shimmer: {
          "0%, 100%": { opacity: "0.35", transform: "translateX(-4%)" },
          "50%": { opacity: "0.9", transform: "translateX(4%)" },
        },
        flutter: {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        marquee: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "28px 0" },
        },
        "pixel-blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0.25" },
        },
        "bow-bounce": {
          "0%, 100%": { transform: "translateY(0) rotate(-3deg)" },
          "50%": { transform: "translateY(-3px) rotate(3deg)" },
        },
        "pop-in": {
          "0%": { transform: "scale(0.5) rotate(-8deg)", opacity: "0" },
          "70%": { transform: "scale(1.08) rotate(2deg)" },
          "100%": { transform: "scale(1) rotate(0)", opacity: "1" },
        },
      },
      animation: {
        "count-pop": "count-pop 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
        flash: "flash 0.5s ease-out forwards",
        "strip-drop": "strip-drop 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        "pulse-ring": "pulse-ring 1.6s ease-out infinite",
        shimmer: "shimmer 2.6s ease-in-out infinite",
        flutter: "flutter 3.2s ease-in-out infinite",
        marquee: "marquee 1.4s linear infinite",
        "pixel-blink": "pixel-blink 1.1s steps(1) infinite",
        "bow-bounce": "bow-bounce 2.4s ease-in-out infinite",
        "pop-in": "pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
