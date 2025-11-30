/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['leaflet', 'react-leaflet'],
    turbopack: {
        root: process.cwd(),
    },
};

module.exports = nextConfig;
