import type { Config } from "tailwindcss";

/** Jaune or CoF — remplace l’ancienne identité violette (classes purple/violet/fuchsia conservées). */
const cofGold = {
  50: "#fffbeb",
  100: "#fff4d6",
  200: "#ffe8a8",
  300: "#fad375",
  400: "#f5bc4a",
  500: "#f3ac41",
  600: "#d99120",
  700: "#b37418",
  800: "#8f5a17",
  900: "#764a18",
  950: "#3f2609",
};

/** Accent chaud pour les gradients (ex-rose / second ton). */
const cofAmber = {
  50: "#fff7ed",
  100: "#ffedd5",
  200: "#fed7aa",
  300: "#fdba74",
  400: "#fb923c",
  500: "#f97316",
  600: "#ea580c",
  700: "#c2410c",
  800: "#9a3412",
  900: "#7c2d12",
  950: "#431407",
};

/** Tons foncés pour les fonds en dégradé (ex-indigo). */
const cofDeep = {
  50: "#fffbeb",
  100: "#fef3c7",
  200: "#fde68a",
  300: "#fcd34d",
  400: "#e8b84d",
  500: "#d99120",
  600: "#b37418",
  700: "#8f5a17",
  800: "#5c3a12",
  900: "#3d260c",
  950: "#1f0f05",
};

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
        brand: {
          DEFAULT: "#f3ac41",
          foreground: "#1a0f05",
        },
        purple: cofGold,
        violet: cofGold,
        fuchsia: cofGold,
        pink: cofAmber,
        indigo: cofDeep,
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
