import typography from "npm:@tailwindcss/typography";
import daisyui from "npm:daisyui@latest";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,ts,tsx}",
    "./_site/**/*.{html,js}",
  ],
  safelist: [
    "grid-cols-2",
    "gap-2",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            "code": {
              "border-radius": "0.25rem",
              "background-color": "rgb(226 232 240)",
              "padding-left": "0.25rem",
              "padding-right": "0.25rem",
              "padding-top": "0.125rem",
              "padding-bottom": "0.125rem",
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
          },
        },
      }),
    },
  },
  plugins: [typography, daisyui],
};
