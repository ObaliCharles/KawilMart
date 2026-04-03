/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
                pathname: '**',
            },
        ],
        formats: ['image/webp', 'image/avif'],
    },
    experimental: {
        optimizePackageImports: ['@clerk/nextjs', 'react-hot-toast'],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
};

export default nextConfig;
