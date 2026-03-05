import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getPieceBySlug,
  getAdjacentPieces,
  getAllPieceSlugs,
  getSiteSettings,
} from "@/lib/sanity.queries";
import { formatDateRange, formatDimensions } from "@/lib/format";
import { visualArtworkJsonLd } from "@/lib/jsonLd";
import { urlFor } from "@/lib/sanity.image";
import { PieceGallery } from "@/components/PieceGallery";
import { PortableText } from "@/components/PortableText";
import styles from "./page.module.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllPieceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [piece, settings] = await Promise.all([
    getPieceBySlug(slug),
    getSiteSettings(),
  ]);

  if (!piece) return {};

  const artistName = settings?.artistName || "Artist";
  const title = `${piece.title} — ${artistName}`;

  const parts: string[] = [];
  if (piece.materials) parts.push(piece.materials);
  const dims = formatDimensions(
    piece.width,
    piece.height,
    piece.depth,
    piece.dimensionUnit
  );
  if (dims) parts.push(dims);
  const description = parts.join(". ").slice(0, 155) || undefined;

  const ogImage = piece.images[0]
    ? urlFor(piece.images[0]).width(1200).height(630).auto("format").url()
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PieceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [piece, settings] = await Promise.all([
    getPieceBySlug(slug),
    getSiteSettings(),
  ]);

  if (!piece) notFound();

  const artistName = settings?.artistName || "Artist";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const { prev, next } = await getAdjacentPieces(piece.endDate, piece._id);

  const dateText = formatDateRange(piece.startDate, piece.endDate);
  const dimensionsText = formatDimensions(
    piece.width,
    piece.height,
    piece.depth,
    piece.dimensionUnit
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            visualArtworkJsonLd(piece, artistName, siteUrl)
          ),
        }}
      />

      <article className={styles.article}>
        <header className={styles.header}>
          <h1 className={styles.title}>{piece.title}</h1>
          <div className={styles.meta}>
            {dateText && <p className={styles.metaLine}>{dateText}</p>}
            {piece.materials && (
              <p className={styles.metaLine}>{piece.materials}</p>
            )}
            {dimensionsText && (
              <p className={styles.metaLine}>{dimensionsText}</p>
            )}
          </div>
        </header>

        <PieceGallery images={piece.images} pieceTitle={piece.title} />

        {piece.description && (
          <section className={styles.description}>
            <PortableText value={piece.description} />
          </section>
        )}

        <nav className={styles.nav} aria-label="Piece navigation">
          {prev ? (
            <Link
              href={`/work/${prev.slug.current}`}
              className={styles.navLink}
            >
              &larr; {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/work/${next.slug.current}`}
              className={styles.navLink}
            >
              {next.title} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </>
  );
}
