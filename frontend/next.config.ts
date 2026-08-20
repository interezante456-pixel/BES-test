import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['panel.oracon.com', 'panel.bes.com', 'localhost:3000', 'localhost:3500', 'localhost'],
};

export default nextConfig;
