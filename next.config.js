/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['res.cloudinary.com', 'i.imgur.com', 'files.catbox.moe'],
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig
