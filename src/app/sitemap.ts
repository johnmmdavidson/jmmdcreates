import type { MetadataRoute } from "next";
import { getAllPieceSlugs } from "@/lib/sanity.queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const slugs = await getAllPieceSlugs();

  const pieceUrls = slugs.map((slug) => ({
    url: `${siteUrl}/work/${slug}`,
    lastModified: new Date(),
  }));

  return [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/bio`, lastModified: new Date() },
    ...pieceUrls,
  ];
}
