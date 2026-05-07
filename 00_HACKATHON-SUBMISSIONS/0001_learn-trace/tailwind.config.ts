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
        sidebar: {
          primary: "#0f172a",
          secondary: "#1e293b",
          tertiary: "#334155",
          accent: "#475569",
          text: {
            primary: "#f8fafc",
            secondary: "#cbd5e1",
            muted: "#94a3b8",
          },
        },
        button: {
          primary: {
            DEFAULT: "#3730a3",
            hover: "#4338ca",
            light: "#6366f1",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
