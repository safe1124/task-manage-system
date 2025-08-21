import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포용 설정 (정적 내보내기 제거)
  trailingSlash: true,
  images: { unoptimized: true },
  // API routes will work normally on Vercel
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "/api/:path*" },
    ];
  },
};

export default nextConfig;
