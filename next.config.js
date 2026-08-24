/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // PostHog API paths end in '/'; Next's automatic 308 trailing-slash redirect would break them.
  // The redirect is re-implemented for app routes in proxy.ts.
  skipTrailingSlashRedirect: true,
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
  // Reverse proxy for PostHog under an innocuous path so adblockers don't block it
  async rewrites() {
    return [
      {
        source: '/flux/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/flux/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/flux/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/essay',
        destination:
          'https://manifoldmarkets.notion.site/Manifund-Essay-Prize-34354492ea7a804dbb44dc4fee8cf82f?source=copy_link',
        permanent: false,
      },
      {
        source: '/surplus',
        destination: 'https://airtable.com/appaxqJfxht7OronH/pag4BXQJgRUkdb6lQ/form',
        permanent: false,
      },
      {
        source: '/discord',
        destination: 'https://discord.com/invite/ZGsDMWSA5Q',
        permanent: false,
      },
      {
        source: '/surplus:star(\\*)',
        destination: 'https://airtable.com/appaxqJfxht7OronH/pag4BXQJgRUkdb6lQ/form',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
