/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    // 動的ルートを静的生成からスキップ
    workerThreads: false,
    cpus: 1
  },
}

module.exports = nextConfig 