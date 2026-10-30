import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "covers.openlibrary.org", pathname: "/b/isbn/**" }],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;
