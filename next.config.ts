import path from "path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
      "@main": path.resolve(__dirname, "src/features/main"),
      "@dictionary": path.resolve(__dirname, "src/features/dictionary"),
      "@analysis-view": path.resolve(__dirname, "src/features/analysis-view"),
      "@analysis-words": path.resolve(__dirname, "src/features/analysis-words"),
      "@auth": path.resolve(__dirname, "src/features/auth"),
      "@notifications": path.resolve(__dirname, "src/features/notifications"),
      "@profile": path.resolve(__dirname, "src/features/profile"),
      "@review": path.resolve(__dirname, "src/features/review"),
      "@training": path.resolve(__dirname, "src/features/training"),
      "@types": path.resolve(__dirname, "src/types"),
    };
    return config;
  },
  async headers() {
    return [
      {
        // Apply CORS headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // or specify your domains
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, X-Requested-With",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
