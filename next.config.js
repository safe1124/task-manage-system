/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  // Netlify 배포 최적화
  outputFileTracingRoot: __dirname,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:8600";
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

module.exports = nextConfig;
