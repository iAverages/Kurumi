/** @type {import("prettier").Config} */
const config = {
    plugins: [require.resolve("prettier-plugin-tailwindcss")],
    printWidth: 120,
    tabWidth: 4,
};

module.exports = config;
