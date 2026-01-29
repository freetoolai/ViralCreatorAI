import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/clients',
        destination: '/portal',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
