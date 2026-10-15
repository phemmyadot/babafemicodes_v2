import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#07080a",
          900: "#0a0c0f",
          800: "#0e1115",
          700: "#13171c",
          600: "#1b2027",
        },
        line: {
          DEFAULT: "rgba(0, 240, 255, 0.14)",
          strong: "rgba(0, 240, 255, 0.35)",
        },
        cyan: { neon: "#00f0ff", dim: "#0a8a93" },
        phosphor: { DEFAULT: "#00ff66", dim: "#0b8a3d" },
        amber: { hud: "#ffb000" },
        alert: "#ff3864",
        fog: { DEFAULT: "#8b96a3", light: "#c5ced8" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 0 1px rgba(0,240,255,.35), 0 0 24px -4px rgba(0,240,255,.45)",
        "glow-green": "0 0 0 1px rgba(0,255,102,.35), 0 0 24px -4px rgba(0,255,102,.45)",
      },
      keyframes: {
        blink: { "0%, 49%": { opacity: "1" }, "50%, 100%": { opacity: "0" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100vh)" } },
        pulseDot: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: ".35", transform: "scale(.75)" },
        },
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        scan: "scan 7s linear infinite",
        "pulse-dot": "pulseDot 1.6s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
