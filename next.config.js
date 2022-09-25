/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    env: {
        COMMIT_HASH: process.env.COMMIT_HASH ?? "dev",
    },
};

module.exports = nextConfig;
