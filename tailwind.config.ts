import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff1f1",
          100: "#ffe1e1",
          200: "#ffc7c7",
          300: "#ffa0a0",
          400: "#ff6868",
          500: "#EA2525", // Official IDS Red
          600: "#d91616",
          700: "#b60f0f",
          800: "#961010",
          900: "#7c1414",
          950: "#440505",
        },
      },
    },
  },
  plugins: [],
};
export default config;
