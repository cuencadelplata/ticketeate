/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  env: {
    NEXT_PUBLIC_GITHUB_OWNER: process.env.GITHUB_OWNER,
    NEXT_PUBLIC_GITHUB_REPO: process.env.GITHUB_REPO,
  },
}

export default nextConfig
