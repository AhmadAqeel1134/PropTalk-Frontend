/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Avoid flaky `.next/cache/webpack/*.pack.gz` and missing `vendor-chunks/*.js` when `.next` is
  // removed while `next dev` runs, or when cache files are interrupted (common on Windows).
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig

