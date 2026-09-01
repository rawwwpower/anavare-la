import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be reached from a phone on the same Wi-Fi (e.g.
  // http://192.168.100.16:3010) for on-device testing. Update this IP if it
  // changes (new network, router reassigns it) — otherwise Next.js silently
  // blocks the HMR/asset requests and the page never hydrates on that device.
  allowedDevOrigins: ["192.168.100.16"],
};

export default nextConfig;
