import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Vercel 배포 시 소스 디렉토리 지정
  experimental: {
    outputFileTracingRoot: __dirname,
  },
  // 소스 디렉토리가 frontend 폴더에 있음을 명시
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
