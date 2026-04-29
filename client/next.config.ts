import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // 테스트를 위해 일시적으로 끔
  eslint: {
    // 기존 실시간 통역 PoC 코드에 남아있는 lint 이슈는 별도 정리하고,
    // 프로덕션 빌드는 랜딩/라우팅 검증을 우선 통과시킨다.
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { bufferutil: 'bufferutil', 'utf-8-validate': 'utf-8-validate' }];
    return config;
  },
};

export default nextConfig;
