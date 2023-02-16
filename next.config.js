/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fkousziwzbnkdkldjper.supabase.co',
        pathname: '/storage/v1/object/public/avatars/**/avatar',
      },
      {
        protocol: 'https',
        hostname: 'manifold.markets',
      },
    ],
  },
}

module.exports = nextConfig
