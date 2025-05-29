import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["img.clerk.com", "s3.amazonaws.com"],
  },
};

export default nextConfig;
