import withMDX from '@next/mdx'

const nextMDX = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config) => {
    // Ignorar warnings específicos
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /UPDATE_ACTIVEDESCENDANT/,
      /node_modules\/@react-aria/,
      /node_modules\/@heroui/,
    ];

    return config;
  },
};

export default nextMDX(nextConfig);