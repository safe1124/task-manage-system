import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8600";
    return [
      { source: "/api/:path*", destination: `${backendUrl}/:path*` },
    ];
  },
  // HEAD 메서드 문제 해결을 위한 설정
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,PATCH,OPTIONS" },
        ],
      },
    ];
  },
};

export default nextConfig;
