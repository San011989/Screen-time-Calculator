import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hosts allowed to load the dev server's scripts and HMR connection.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.1.6"],
};

export default nextConfig;