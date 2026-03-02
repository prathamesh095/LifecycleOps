/**
 * Next.js configuration with performance and security optimizations
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable compression for faster transfers
  compress: true,

  // Optimize images
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    sizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for versioned assets
  },

  // Set request timeout to catch slow API calls
  serverRuntimeConfig: {
    apiTimeout: 30000, // 30 seconds
  },

  // Optimize bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side bundle
      config.optimization = {
        ...config.optimization,
        usedExports: true,
      };
    }

    return config;
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirect HTTP to HTTPS in production
  async redirects() {
    return process.env.NODE_ENV === 'production'
      ? [
          {
            source: '/:path*',
            has: [
              {
                type: 'header',
                key: 'x-forwarded-proto',
                value: '(?!https)',
              },
            ],
            destination: 'https://:host/:path*',
            permanent: true,
          },
        ]
      : [];
  },

  // Rewrite API routes for better performance
  async rewrites() {
    return {
      beforeFiles: [
        // These rewrite patterns don't add any overhead
      ],
      afterFiles: [
        // Fallback rewrites
      ],
    };
  },

  // Environment variables available to browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'ApexJob',
  },

  // Enable experimental features for better performance
  experimental: {
    // Optimized package imports
    optimizePackageImports: [
      '@radix-ui',
      'lucide-react',
    ],

    // Server components optimization
    serverComponentsExternalPackages: ['@prisma/client'],
  },

  // PoweredByHeader disabled for security
  poweredByHeader: false,

  // Stable sort for consistent output
  reactStrictMode: true,

  // Production source maps for error tracking
  productionBrowserSourceMaps: true,

  // SWC minification (faster than Terser)
  swcMinify: true,
};

export default nextConfig;
