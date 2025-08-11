/** @type {import('next').NextConfig} */
const nextConfig = {
     // …
  experimental: {
    // …
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  eslint: {
    ignoreDuringBuilds: true,
},
  
  
};

export default nextConfig;
