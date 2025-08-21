import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Railway 배포용 설정 (정적 내보내기)
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  distDir: "out",
  // 정적 내보내기 시 rewrites는 작동하지 않음
  // async rewrites() {
  //   return [
  //     { source: "/api/:path*", destination: "http://localhost:8600/:path*" },
  //   ];
  // },
};

export default nextConfig;
