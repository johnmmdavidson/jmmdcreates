import type { NextConfig } from "next";

// A static export, served from Cloudflare by worker/index.ts.
const nextConfig: NextConfig = {
  output: "export",
  // Sanity's image CDN resizes; there is no Next image optimizer.
  images: { loader: "custom", loaderFile: "./src/lib/sanity.loader.ts" },
};

export default nextConfig;
