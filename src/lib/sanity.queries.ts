import { client } from "./sanity.client";
import type { Piece, SiteSettings } from "./sanity.types";

const isConfigured =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder";

// The build fails on any Sanity error, so a broken read never deploys an empty portfolio.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeFetch<T>(query: string, params?: any): Promise<T | null> {
  if (!isConfigured) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set for the build");
  try {
    return await client.fetch<T>(query, params);
  } catch (err) {
    throw new Error("Sanity query failed during build: " + (err instanceof Error ? err.message : String(err)));
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  return safeFetch<SiteSettings>(
    `*[_type == "siteSettings"][0]{
      artistName,
      artistStatement,
      bio,
      bioImage{..., alt, "lqip": asset->metadata.lqip},
      contactEmail,
      seoTitle,
      seoDescription,
      ogImage
    }`
  );
}

export async function getAllPieces(): Promise<Piece[]> {
  const result = await safeFetch<Piece[]>(
    `*[_type == "piece"] | order(endDate desc){
      _id,
      title,
      slug,
      images[]{..., "lqip": asset->metadata.lqip},
      startDate,
      endDate,
      materials,
      width,
      height,
      depth,
      dimensionUnit,
      description
    }`
  );
  return result || [];
}

export async function getPieceBySlug(slug: string): Promise<Piece | null> {
  return safeFetch<Piece>(
    `*[_type == "piece" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      images[]{..., "lqip": asset->metadata.lqip},
      startDate,
      endDate,
      materials,
      width,
      height,
      depth,
      dimensionUnit,
      description
    }`,
    { slug }
  );
}

export async function getAdjacentPieces(
  endDate: string,
  currentId: string
): Promise<{ prev: Pick<Piece, "title" | "slug"> | null; next: Pick<Piece, "title" | "slug"> | null }> {
  const [prev, next] = await Promise.all([
    safeFetch<Pick<Piece, "title" | "slug">>(
      `*[_type == "piece" && (endDate > $endDate || (endDate == $endDate && _id > $id))] | order(endDate asc, _id asc)[0]{
        title,
        slug
      }`,
      { endDate, id: currentId }
    ),
    safeFetch<Pick<Piece, "title" | "slug">>(
      `*[_type == "piece" && (endDate < $endDate || (endDate == $endDate && _id < $id))] | order(endDate desc, _id desc)[0]{
        title,
        slug
      }`,
      { endDate, id: currentId }
    ),
  ]);
  return { prev: prev || null, next: next || null };
}

export async function getAllPieceSlugs(): Promise<string[]> {
  const result = await safeFetch<string[]>(`*[_type == "piece"].slug.current`);
  return result || [];
}
