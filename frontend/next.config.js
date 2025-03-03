/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: true,
  },
  // Azure Web Apps用の設定を追加
  env: {
    PORT: process.env.PORT || '8080'
  },
  // 追加の設定
  poweredByHeader: false,
  generateEtags: true,
  distDir: '.next'
}

module.exports = nextConfig 