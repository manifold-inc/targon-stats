import { type Config } from "tailwindcss";
import animation from "tailwindcss-animated";

export default {
  content: ["./src/**/*.tsx"],

  theme: {
    transparent: "transparent",
    current: "currentColor",
    fontFamily: {
      sans: ["var(--font-inter)", "sans-serif"],
      saira: ["var(--font-saira)", "sans-serif"],
    },
    extend: {
      colors: {
        mf: {
          night: {
            300: "#2a2c33",
            400: "#20222d",
            500: "#191b20",
            600: "#1a1c24",
            650: "#1c1e27",
            690: "#191c22",
            700: "#101114",
          },
          sky: {
            300: "#8dc7fe",
            500: "#53abfd",
            700: "#51abff",
          },
          shelby: {
            300: "#aebafe",
            500: "#8fa0fe",
            700: "#6f85ff",
            800: "#282a38",
          },
          sally: {
            300: "#aad6ff",
            400: "#94ccff",
            500: "#7cc0ff",
            600: "#5fb1ff",
            700: "#52abff",
            800: "#282a38",
            900: "#2b435f",
          },
          safety: {
            300: "#ff9b7a",
            500: "#ff8156",
            700: "#f36a40",
            800: "#2f272c",
          },
          sybil: {
            300: "#84f5cc",
            500: "#58e8b4",
            550: "#44d7ad",
            600: "#56e8b4",
            700: "#19d692",
            800: "#233033",
          },
          ash: {
            300: "#3a3c46",
            400: "#1d2029",
            500: "#22242e",
            700: "#17181f",
          },
          edge: {
            300: "#d7e5ff",
            500: "#c5dbff",
            700: "#a3b5d6",
          },
          milk: {
            300: "#e0ebff",
            500: "#d2e3ff",
            600: "#b4c8e9",
            700: "#aec0d6",
          },
          light: {
            blue: "#7cc0ff",
          },
          gray: {
            dark: "#272d38",
            DEFAULT: "#606371",
            700: "#242a34",
            light: "#2e3342",
            another: "#333333",
            googleWhite: "#f7f7f7",
            settings: "#343640",
            footer: "#616371",
            plan: "#282c39",
          },
        },
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ["hover", "ui-selected"],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [
    animation,
    require("@tailwindcss/typography"),
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/forms"),
  ],
  darkMode: "class",
} satisfies Config;
