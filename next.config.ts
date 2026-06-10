import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	experimental: {
		serverActions: {
			bodySizeLimit: '700mb',
		},
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
			},
			{
				protocol: 'https',
				hostname: '**.backblazeb2.com',
			},
		],
		formats: ['image/avif', 'image/webp'],
		deviceSizes: [640, 750, 828, 1080, 1200],
		imageSizes: [64, 128, 256, 384],
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production'
			? { exclude: ['error', 'warn'] }
			: false,
	},
};

export default nextConfig;