import type { NextConfig } from "next";

// STATIC_EXPORT=1 is the Cloudflare build (a static export served by worker/index.ts).
// Unset, the build is Vercel's.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  output: staticExport ? "export" : undefined,
  // route.vercel.ts (the Vercel-only sign-up route) is a route only in the Vercel build (removed in PR 3).
  pageExtensions: staticExport ? ["tsx", "ts"] : ["tsx", "ts", "vercel.ts"],
  // Sanity's image CDN resizes; no Next image optimizer on either host.
  images: { loader: "custom", loaderFile: "./src/lib/sanity.loader.ts" },
};

export default nextConfig;
