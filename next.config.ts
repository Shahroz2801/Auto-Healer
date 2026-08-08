import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // BullMQ conditionally requires @valkey/valkey-glide (an alternative
  // client we don't use — we connect via ioredis) and mariadb's native
  // bindings; both are fine as real Node `require`s at runtime but webpack
  // can't statically resolve them for bundling, so keep them external
  // instead of silently mis-bundling.
  serverExternalPackages: ["bullmq", "mariadb"],
};

export default nextConfig;
