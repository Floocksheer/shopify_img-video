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
        // Lumora dark system — iris violet on near-black
        night: "#0A0A0F",
        surface: "#121218",
        elevated: "#1A1A24",
        floating: "#222230",
        iris: {
          DEFAULT: "#7C6CFF",
          bright: "#9284FF",
          deep: "#5847E8",
          faint: "#28244A",
        },
        ink: "#F2F1F7",
        muted: "#8E8CA3",
        dim: "#5C5A72",
        line: "rgba(255,255,255,0.08)",
        success: "#4ADE9C",
        warning: "#F5B04C",
        danger: "#FF6B7A",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      letterSpacing: {
        display: "-0.03em",
      },
      lineHeight: {
        body: "1.7",
      },
      boxShadow: {
        // layered, violet-tinted — never flat shadow-md
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -8px rgba(124,108,255,0.06)",
        lift: "0 2px 4px rgba(0,0,0,0.5), 0 16px 40px -12px rgba(124,108,255,0.14)",
        glow: "0 0 0 1px rgba(124,108,255,0.35), 0 4px 24px -4px rgba(124,108,255,0.45)",
        button:
          "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(0,0,0,0.5), 0 6px 20px -6px rgba(124,108,255,0.55)",
      },
      borderRadius: {
        card: "1rem",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "fade-up": "fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        marquee: "marquee 40s linear infinite",
        orbit: "orbit 24s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
