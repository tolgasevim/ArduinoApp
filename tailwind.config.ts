import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        slateBlue: "#1C2541",
        neonMint: "#57F287",
        warmSun: "#FFC857",
        coral: "#FF6F59",
        sky: "#5BC0EB"
      },
      boxShadow: {
        card: "0 16px 30px rgba(28, 37, 65, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;

