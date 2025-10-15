/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: [
      'images.unsplash.com', 
      'via.placeholder.com', 
      'fakestoreapi.com',
      'picsum.photos',
      'supabase.co',
      'supabase.com',
      'localhost'
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    serverActions: true
  }
};

module.exports = nextConfig;