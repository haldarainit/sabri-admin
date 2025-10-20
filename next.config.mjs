/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize static assets
  experimental: {
    // remove optimizeCss to avoid critters requirement during prerender
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Configure headers for better caching
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Compress responses
  compress: true,

  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
