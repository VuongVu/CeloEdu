// @ts-check

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        formats: ['image/avif', 'image/webp'],
    },
    swcMinify: process.env.NODE_ENV === 'development',
    webpack: config => {
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        };

        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            child_process: false,
            readline: false,
        };

        return config;
    },
};

module.exports = withBundleAnalyzer(nextConfig);
