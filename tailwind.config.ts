import { type Config } from "tailwindcss";
import animation from "tailwindcss-animated";

export default {
  content: ["./src/**/*.tsx"],
  plugins: [
    animation,
    require("@tailwindcss/typography"),
    require("@headlessui/tailwindcss"),
    require("@tailwindcss/forms"),
  ],
} satisfies Config;
