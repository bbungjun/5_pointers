/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['@my-project/ui'],
  experimental: {
    esmExternals: false
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // UI 패키지 alias 추가
    config.resolve.alias = {
      ...config.resolve.alias,
      '@my-project/ui': require('path').resolve(__dirname, '../../packages/ui/src/index.tsx'),
    };
    
    return config;
  }
}

module.exports = nextConfig