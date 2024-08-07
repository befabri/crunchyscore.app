/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
module.exports = {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        extend: {
            colors: {
                custom_orange: "#F47521",
                custom_blue: "#2F52A2",
                custom_black: "#1F2421",
                custom_night: "#141414",
            },
            fontFamily: {
                sans: ["InterVariable", "Inter", ...defaultTheme.fontFamily.sans],
            },
            screens: {
                'xs': '475px',  // Example breakpoint for 'xs'
              }
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
