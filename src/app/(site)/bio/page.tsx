import type { Metadata } from "next";
import Image from "next/image";
import { getSiteSettings } from "@/lib/sanity.queries";
import { urlFor } from "@/lib/sanity.image";
import { PortableText } from "@/components/PortableText";
import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  if (!settings) return {};

  const title = `About ${settings.artistName} — Seattle Artist`;

  return {
    title,
    openGraph: { title },
  };
}

export default async function BioPage() {
  const settings = await getSiteSettings();
  const artistName = settings?.artistName || "Artist";

  return (
    <article className={styles.article}>
      <h1 className={styles.title}>{artistName}</h1>

      <div className={styles.content}>
        {settings?.bioImage && (
          <div className={styles.imageWrap}>
            <Image
              src={urlFor(settings.bioImage).width(800).auto("format").url()}
              alt={settings.bioImage.alt || `Portrait of ${artistName}`}
              width={800}
              height={1000}
              sizes="(min-width: 768px) 400px, 100vw"
              className={styles.image}
              priority
              placeholder={settings.bioImage.lqip ? "blur" : undefined}
              blurDataURL={settings.bioImage.lqip || undefined}
            />
          </div>
        )}

        {settings?.bio && (
          <div className={styles.text}>
            <PortableText value={settings.bio} />
          </div>
        )}
      </div>

      {settings?.contactEmail && (
        <div className={styles.contact}>
          <a
            href={`mailto:${settings.contactEmail}`}
            className={styles.emailLink}
          >
            {settings.contactEmail}
          </a>
        </div>
      )}
    </article>
  );
}
