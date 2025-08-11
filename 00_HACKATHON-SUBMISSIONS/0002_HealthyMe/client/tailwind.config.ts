import type { Config } from "tailwindcss";
const {nextui} = require("@nextui-org/react");
const plugin = require('tailwindcss/plugin')

const config: Config = {
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",

    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      textShadow: {
        sm: '0 1px 50px var(--tw-shadow-color)',
        DEFAULT: '0 6px 43px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
      colors:{
        'custom-blue':"#1678F2",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily:{
        'systemUi': ['system-ui'],
        'bbManual': ['bb-manual'],
      },
    },
  },
  darkMode: "class",
  plugins: [ plugin(function ({ matchUtilities, theme }:any) {
    matchUtilities(
      {
        'text-shadow': (value:any) => ({
          textShadow: value,
        }),
      },
      { values: theme('textShadow') }
    )
  }),nextui()],
};
export default config;
