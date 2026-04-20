/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fkousziwzbnkdkldjper.supabase.co',
        pathname: '/storage/v1/object/public/avatars/*/*',
      },
      {
        protocol: 'https',
        hostname: 'fkousziwzbnkdkldjper.supabase.co',
        pathname: '/storage/v1/object/public/round-header-images/*',
      },
      {
        protocol: 'https',
        hostname: 'fkousziwzbnkdkldjper.supabase.co',
        pathname: '/storage/v1/object/public/round-header-images/*/*',
      },
      {
        protocol: 'https',
        hostname: 'manifold.markets',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        pathname: '/a/h06lDL9',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/essay',
        destination:
          'https://manifoldmarkets.notion.site/Manifund-Essay-Prize-34354492ea7a804dbb44dc4fee8cf82f?source=copy_link',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
