import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Headshots come from Breakdown Services' public S3 bucket; render them
    // directly (no optimizer proxy) to keep the Vercel image quota at zero.
    unoptimized: true,
  },
};

export default nextConfig;
