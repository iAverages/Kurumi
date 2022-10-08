module.exports = {
    plugins: [require("prettier-plugin-tailwindcss")],
    tabWidth: 4,
    printWidth: 125,
    proseWrap: "always",
    overrides: [
        {
            files: ["*.yml", "*.yaml"],
            options: {
                parser: "yaml",
                tabWidth: 2,
            },
        },
    ],
};
