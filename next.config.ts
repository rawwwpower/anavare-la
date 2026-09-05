import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the dev server be reached from a phone on the same Wi-Fi (e.g.
  // http://192.168.100.16:3010) for on-device testing. Update this IP if it
  // changes (new network, router reassigns it) — otherwise Next.js silently
  // blocks the HMR/asset requests and the page never hydrates on that device.
  allowedDevOrigins: ["192.168.100.16"],

  poweredByHeader: false,

  // Everything under /public is served with no cache by default, so the
  // artwork is re-downloaded on every visit. A day of freshness plus a week
  // of stale-while-revalidate makes repeat visits instant while still
  // picking up a replaced file on the next load — no filename hashing, no
  // risk of a swapped image being stuck in someone's browser for a year.
  async headers() {
    return [
      {
        source: "/toys/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
