// next/image loader: Sanity's image CDN does the resizing. Keeps the crop's aspect ratio.
export default function sanityLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const url = new URL(src);
  if (url.hostname !== "cdn.sanity.io") return src;
  const w0 = Number(url.searchParams.get("w"));
  const h0 = Number(url.searchParams.get("h"));
  url.searchParams.set("w", String(width));
  if (w0 && h0) url.searchParams.set("h", String(Math.round((h0 * width) / w0)));
  url.searchParams.set("q", String(quality || 75));
  url.searchParams.set("auto", "format");
  return url.toString();
}
