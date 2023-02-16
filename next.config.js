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
        port: '',
        pathname: '/storage/v1/object/public/avatars/**/avatar',
      },
    ],
  },
}

module.exports = nextConfig
