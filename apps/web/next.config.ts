// Next.js가 실제로 앱을 켤 때 읽는 설정 파일. 지금은 기본값 그대로.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "10.227.209.50",
    "10.253.25.50",
    "192.168.96.194",
  ],
};

export default nextConfig;
