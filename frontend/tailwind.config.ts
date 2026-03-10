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
        "fadeInUp": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fadeInScale": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "progress-full": "progress-full 1.5s linear forwards",
        "fadeIn": "fadeIn 0.5s ease-out forwards",
        "fadeInUp": "fadeInUp 0.5s ease-out forwards",
        "fadeInScale": "fadeInScale 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
