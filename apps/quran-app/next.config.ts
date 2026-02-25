import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Support RTL et i18n futur
  i18n: {
    locales: ['fr', 'ar', 'en'],
    defaultLocale: 'fr',
    localeDetection: false,
  },

  // Images autorisées depuis nos domaines
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.alquran.cloud' },
      { protocol: 'https', hostname: 'cdn.islamic.network' },
    ],
  },

  // Headers de sécurité
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
