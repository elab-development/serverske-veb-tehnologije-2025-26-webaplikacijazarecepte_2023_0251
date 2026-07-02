/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,ts, scss}"],
    theme: {
        extend: {
            colors: {
                light: "#e0e0f0",
                dark: "#202020",
                separator: "#757473",
                "sw1": "#ffe6a7",
                "sw2": "#502b15",
                "sa1": "#f4acb7",
                "sa2": "#4b173a",
                "sp1": "#db5856",
                "sp2": "#5b0415",
                "so1": "#82c0cc",
                "so2": "#1b3a4b",
            },
            fontFamily: {
                sans: ["Oregano", "cursive"],
            },
            fontSize: {
                sm: "14px",
                base: "18px",
                md: "22px",
                lg: "26px",
                xl: "38px",
            },
        },
    },
    plugins: [],
};
