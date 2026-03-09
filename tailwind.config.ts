import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: "#1d9bf0",
          dark: "#0f1419",
          border: "#2f3336",
          hover: "#080808",
          text: "#71767b",
        },
      },
    },
  },
  plugins: [],
};

export default config;
