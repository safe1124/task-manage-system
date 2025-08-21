import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel 배포용 설정 (정적 내보내기 제거)
  images: { unoptimized: true },
  // Proxy API to Railway backend to keep cookies first-party on Vercel
  async rewrites() {
    return [
      { source: "/api/:path*", destination: "https://3minutetasker.up.railway.app/:path*" },
    ];
  },
};

export default nextConfig;
