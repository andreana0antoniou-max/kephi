import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tangerine: "#F26B3A",
        teal: "#1F9E8F",
        plum: "#8E4585",
        gold: "#E0A93B",
        ink: "#262130",
        cream: "#F7F1E7",
      },
      fontFamily: {
        heading: ["var(--font-fredoka)", "sans-serif"],
        body: ["var(--font-nunito)", "sans-serif"],
      },
      borderRadius: {
        kephi: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
