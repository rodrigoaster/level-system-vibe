import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.NODE_ENV !== "production") {
      return [
        {
          source: "/(.*)",
          headers: [
            { key: "Cache-Control", value: "no-store, must-revalidate" },
          ],
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
