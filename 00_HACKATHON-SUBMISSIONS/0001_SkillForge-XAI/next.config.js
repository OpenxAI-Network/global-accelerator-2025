/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'skillforge-xai.vercel.app'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig