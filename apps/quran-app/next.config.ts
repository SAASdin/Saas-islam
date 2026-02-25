import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Note : i18n dans App Router se gère via middleware, pas via next.config
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
