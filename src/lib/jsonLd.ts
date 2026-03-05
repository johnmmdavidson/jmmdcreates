import type { Piece, SiteSettings } from "./sanity.types";
import { urlFor } from "./sanity.image";

export function personJsonLd(settings: SiteSettings, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.artistName,
    url: siteUrl,
    jobTitle: "Artist",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Seattle",
      addressRegion: "WA",
    },
  };
}

export function visualArtworkJsonLd(
  piece: Piece,
  artistName: string,
  siteUrl: string
) {
  const unit = piece.dimensionUnit || "in";
  const endParts = piece.endDate.split("-");
  const dateCreated = `${endParts[0]}-${endParts[1]}`;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: piece.title,
    url: `${siteUrl}/work/${piece.slug.current}`,
    creator: {
      "@type": "Person",
      name: artistName,
    },
    dateCreated,
  };

  if (piece.materials) data.artMedium = piece.materials;
  if (piece.width) data.width = `${piece.width} ${unit}`;
  if (piece.height) data.height = `${piece.height} ${unit}`;
  if (piece.depth) data.depth = `${piece.depth} ${unit}`;

  if (piece.images?.[0]) {
    data.image = urlFor(piece.images[0]).width(1200).url();
  }

  return data;
}
