const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin")

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
}

module.exports = nextConfig
// const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
// const withTM = require("next-transpile-modules)(["monaco-editor"]);

// module.exports = withTM({
//     webpack: (config) => {
//         const rule = config.module.rules
//             .find((rule) => rule.oneOf)
//             .oneOf.find(
//                 (r) =>
//                     // Find the global CSS loader
//                     r.issuer && r.issuer.include && r.issuer.include.includes("_app")
//             );
//         if (rule) {
//             rule.issuer.include = [
//                 rule.issuer.include,
//                 // Allow `monaco-editor` to import global CSS:
//                 /[\\/]node_modules[\\/]monaco-editor[\\/]/,
//             ];
//         }

//         config.plugins.push(
//             new MonacoWebpackPlugin({
//                 languages: ["typescript", "javascript"],
//                 filename: "static/[name].worker.js",
//             })
//         );
//         config.resolve.alias["monaco-editor"] = "/home/dan/notes/node_modules/monaco-editor";
//         console.log(config.module.rules);
//         return config;
//     },
// });
