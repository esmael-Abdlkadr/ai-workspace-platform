import type { NextConfig } from 'next';
import path from 'path';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(path.resolve(__dirname, '../..'));

const nextConfig: NextConfig = {
  serverExternalPackages: ['@workspace/db', '@workspace/agents', '@workspace/rag', '@workspace/notion'],
};

export default nextConfig;
