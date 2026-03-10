import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0e27",
      },
      keyframes: {
        "progress-full": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        },
        "fadeIn": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fadeOut": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "fadeInUp": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fadeInScale": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "fadeOutScale": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(0.95)" },
        },
        "slideInRight": {
          "0%": { opacity: "0", transform: "translateX(300px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slideOutRight": {
          "0%": { opacity: "1", transform: "translateX(0)" },
          "100%": { opacity: "0", transform: "translateX(300px)" },
        },
        "slideInX": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "popIn": {
          "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.9)" },
          "100%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        "popOut": {
          "0%": { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(0.9)" },
        },
      },
      animation: {
        "progress-full": "progress-full 1.5s linear forwards",
        "fadeIn": "fadeIn 0.5s ease-out forwards",
        "fadeOut": "fadeOut 0.3s ease-out forwards",
        "fadeInUp": "fadeInUp 0.5s ease-out forwards",
        "fadeInScale": "fadeInScale 0.5s ease-out forwards",
        "fadeOutScale": "fadeOutScale 0.3s ease-out forwards",
        "slideInRight": "slideInRight 0.3s ease-out forwards",
        "slideOutRight": "slideOutRight 0.3s ease-out forwards",
        "slideInX": "slideInX 0.3s ease-out forwards",
        "popIn": "popIn 0.3s ease-out forwards",
        "popOut": "popOut 0.3s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
