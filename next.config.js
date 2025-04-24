/** @type {import('next').NextConfig} */
const nextConfig = {
  // Handle image domains for remote images if needed
  images: {
    domains: [],
  },
  // Configure rewrites to serve files from the uploads directory
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

module.exports = nextConfig; 