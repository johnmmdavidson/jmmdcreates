import type { Metadata } from "next";
import { getSiteSettings, getAllPieces } from "@/lib/sanity.queries";
import { PortableText } from "@/components/PortableText";
import { PieceCard } from "@/components/PieceCard";
import { personJsonLd } from "@/lib/jsonLd";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  if (!settings) return {};

  const title =
    settings.seoTitle ||
    `${settings.artistName} — Sculptor, Woodworker & Fiber Artist in Seattle`;

  const description = settings.seoDescription || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function HomePage() {
  const [settings, pieces] = await Promise.all([
    getSiteSettings(),
    getAllPieces(),
  ]);

  const artistName = settings?.artistName || "Artist";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            settings ? personJsonLd(settings, siteUrl) : {}
          ),
        }}
      />

      <section className={styles.hero}>
        <h1 className={styles.heroName}>{artistName}</h1>
        {settings?.artistStatement && (
          <PortableText
            value={settings.artistStatement}
            className={styles.statement}
          />
        )}
      </section>

      <section className={styles.pieces}>
        {pieces.map((piece, i) => (
          <PieceCard
            key={piece._id}
            piece={piece}
            priority={i === 0}
            skipAnimation={i === 0}
          />
        ))}

        {pieces.length === 0 && (
          <p className={styles.empty}>No pieces yet.</p>
        )}
      </section>
    </>
  );
}
