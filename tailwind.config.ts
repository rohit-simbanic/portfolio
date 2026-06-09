import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        cream: {
          50: "rgba(var(--cream-50), <alpha-value>)",
          100: "rgba(var(--cream-100), <alpha-value>)",
          200: "rgba(var(--cream-200), <alpha-value>)",
        },
        ink: {
          900: "rgba(var(--ink-900), <alpha-value>)",
          800: "rgba(var(--ink-800), <alpha-value>)",
          600: "rgba(var(--ink-600), <alpha-value>)",
          400: "rgba(var(--ink-400), <alpha-value>)",
        },
        citrus: {
          400: "rgba(var(--citrus-400), <alpha-value>)",
          500: "rgba(var(--citrus-500), <alpha-value>)",
          600: "rgba(var(--citrus-600), <alpha-value>)",
        },
        sage: {
          400: "#7BAE8C",
          500: "#5A9470",
          600: "#3D7354",
        },
        rose: {
          400: "#E8836A",
          500: "#D4644A",
          600: "#B54A30",
        },
        sky: {
          400: "#6BAED6",
          500: "#4A90C4",
          600: "#2E6FA8",
        },
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.8s ease-out forwards",
        "marquee": "marquee 25s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
