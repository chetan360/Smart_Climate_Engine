import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "var(--notion-bg)",
          sidebar: "var(--notion-sidebar)",
          text: "var(--notion-text)",
          secondary: "var(--notion-secondary)",
          border: "var(--notion-border)",
          hover: "var(--notion-hover)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
