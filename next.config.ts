import type { NextConfig } from "next";

const apiProxyTarget = process.env.NEXT_PUBLIC_API_PROXY_TARGET;

const nextConfig: NextConfig = {
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
  async rewrites() {
    const rewrites = [
      {
        source: "/library-assets/:path*",
        destination: apiProxyTarget
          ? `${apiProxyTarget}/library-assets/:path*`
          : "/api/library-assets/:path*",
      },
    ];

    if (apiProxyTarget) {
      rewrites.push({
        source: "/api/:path*",
        destination: `${apiProxyTarget}/api/:path*`,
      });
    }

    return rewrites;
  },
};

export default nextConfig;
