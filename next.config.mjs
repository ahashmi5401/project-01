import dns from 'dns';

// Fix: Node 17+ defaults to IPv6-first DNS lookup order which breaks MongoDB Atlas SRV queries.
// Forcing Cloudflare/Google DNS + IPv4-first order ensures the lookup succeeds on all machines.
dns.setServers(['1.1.1.1', '8.8.8.8']);
dns.setDefaultResultOrder('ipv4first');

const BASE_URL = 'https://simufluxlab.com';

/** @type {import('next').NextConfig} */
const nextConfig = {

  webpack: (config) => {
    // Use in-memory cache on Windows (avoids OneDrive file-locking issues with .next/cache)
    config.cache = {
      type: 'memory',
    };
    return config;
  },
  images: {
    remotePatterns: [
      // Cloudinary CDN (production image uploads — services, courses, payment screenshots)
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        source: '/(.*)',
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
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Restrict admin API routes to same-origin
      {
        source: '/api/admins/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
