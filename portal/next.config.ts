import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/wiki",
        destination: "/api/wiki",
      },
      {
        source: "/wiki/:path((?!.*\\.(?:css|js|png|webp|jpg|jpeg|svg|gif|ico|json|xml|txt|woff2?|ttf|html)$).*)",
        destination: "/api/wiki/:path*",
      },
    ];
  },
};

export default nextConfig;