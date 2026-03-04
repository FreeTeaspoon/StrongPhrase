import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "api.dicebear.com" },
      { hostname: "avataaars.io" },
      { hostname: "xsgames.co" },
      { hostname: "randomuser.me" },
      { hostname: "ui-avatars.com" },
      { hostname: "cdn.jsdelivr.net" },
      { hostname: "imgs.xkcd.com" },
    ],
  },
};

export default nextConfig;
