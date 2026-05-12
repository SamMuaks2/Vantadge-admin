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
        brand: {
          purple: "#7B2D8B",
          "purple-light": "#A855C8",
          mint: "#4ECDA4",
          "mint-light": "#7EDFC0",
          teal: "#2BB5A0",
        },
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        script: ["var(--font-dancing)", "cursive"],
        body: ["var(--font-dm-sans)", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7B2D8B 0%, #4ECDA4 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #A855C820 0%, #4ECDA420 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
