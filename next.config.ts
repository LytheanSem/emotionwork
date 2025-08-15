import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Handle worker_threads module for Payload CMS
    if (!isServer) {
      // Fallback for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        worker_threads: false,
        pino: false,
        "pino-pretty": false,
        "pino-abstract-transport": false,
      };
    }

    return config;
  },
  // Ensure proper transpilation for Payload
  transpilePackages: ["payload", "@payloadcms/next"],
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ["payload", "@payloadcms/next"],
  },
  // Additional configurations for better compatibility
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default withPayload(nextConfig);
