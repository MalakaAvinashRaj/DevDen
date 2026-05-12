import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['fs', 'path', 'os', 'child_process'],
};

export default nextConfig;
