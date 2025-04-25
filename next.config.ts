/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost', 
      'keepsake-three.vercel.app',
      'public.blob.vercel-storage.com',
      'urs4msfgsmzpjesw.public.blob.vercel-storage.com',
      'urs4msfgsmzpjesw.blob.vercel-storage.com'
    ],
  },
  // Add configuration to serve files from the uploads directory
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
