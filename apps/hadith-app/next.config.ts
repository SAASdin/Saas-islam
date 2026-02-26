import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // pg est un module Node.js — ne pas bundler côté client
  serverExternalPackages: ['pg'],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'sunnah.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
