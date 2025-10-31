import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix cache issues with Turbopack
  experimental: {
    turbo: {
      resolveAlias: {
        // Prevent cache corruption
      },
    },
  },
  // Better error handling for dev mode
  onDemandEntries: {
    // Period in ms to keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
