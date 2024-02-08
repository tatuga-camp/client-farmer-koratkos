import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./index.html",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/primereact/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "super-main-color": "#5C430D",
        "main-color": "#597E52",
        "secondary-color": "#3193A9",
        "third-color": "#C6A969",
        "fourth-color": "#FFFFEC",
      },
      fontFamily: {
        Anuphan: ["Anuphan", "sans-serif"],
      },
    },
  },
  plugins: [
    require("tailwindcss-react-aria-components")({ prefix: "rac" }),
    require("tailwindcss-animate"),
  ],
};
export default config;
