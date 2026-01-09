/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for potential subdomain deployment
  output: 'standalone',

  // Configure base path if needed for subdomain routing
  basePath: process.env.ADMIN_BASE_PATH || '',

  // Asset prefix for CDN or subdomain
  assetPrefix: process.env.ADMIN_ASSET_PREFIX || '',

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      allowedOrigins: ['admin-dash.eventskona.com', 'localhost:3001'],
    },
  },

  // Image optimization
  images: {
    domains: ['alproseltech.com'],
  },

  // Environment variables available to the browser
  env: {
    ADMIN_DOMAIN: process.env.ADMIN_DOMAIN || 'admin-dash.eventskona.com',
  },
};

module.exports = nextConfig;
