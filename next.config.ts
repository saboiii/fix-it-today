import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
        pathname: '',
        search: '',
      },
      {
        protocol: 'https',
        hostname: 'fixittoday.s3.amazonaws.com',
        port: '',
        pathname: '',
        search: '',
      },
    ],
  },
};

export default nextConfig;
