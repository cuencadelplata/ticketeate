import withMDX from '@next/mdx'
import fs from 'fs';
import path from 'path';

const nextMDX = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /UPDATE_ACTIVEDESCENDANT/,
      /node_modules\/@react-aria/,
      /node_modules\/@heroui/,
    ];

    return config;
  },
  experimental: {
    optimizePackageImports: ['@repo/ui'],
  },
  onDemandEntries: {
    maxInactiveAge: 1000 * 60 * 60 * 24,
  },
};

export default nextMDX(nextConfig);