"use client";

import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity.image";
import { formatDateRange, formatDimensions } from "@/lib/format";
import { ScrollReveal } from "./ScrollReveal";
import type { Piece } from "@/lib/sanity.types";
import styles from "./PieceCard.module.css";

interface PieceCardProps {
  piece: Piece;
  priority?: boolean;
  skipAnimation?: boolean;
}

const MAX_THUMBS = 4;

export function PieceCard({
  piece,
  priority = false,
  skipAnimation = false,
}: PieceCardProps) {
  const primaryImage = piece.images[0];
  const thumbnails = piece.images.slice(1);
  const showThumbs = thumbnails.slice(0, MAX_THUMBS);
  const extraCount = thumbnails.length - MAX_THUMBS;

  const dateText = formatDateRange(piece.startDate, piece.endDate);
  const dimensionsText = formatDimensions(
    piece.width,
    piece.height,
    piece.depth,
    piece.dimensionUnit
  );

  const primaryUrl = urlFor(primaryImage)
    .width(1200)
    .height(800)
    .fit("crop")
    .auto("format")
    .url();
  const primaryAlt =
    primaryImage.alt || `${piece.title}, primary image`;

  return (
    <ScrollReveal skip={skipAnimation}>
      <article className={styles.card}>
        <Link
          href={`/work/${piece.slug.current}`}
          className={styles.cardLink}
        >
          <div className={styles.imageColumn}>
            <div className={styles.primaryImageWrap}>
              <Image
                src={primaryUrl}
                alt={primaryAlt}
                width={1200}
                height={800}
                sizes="(min-width: 768px) 58vw, 100vw"
                className={styles.primaryImage}
                priority={priority}
                placeholder={primaryImage.lqip ? "blur" : undefined}
                blurDataURL={primaryImage.lqip || undefined}
              />
            </div>

            {showThumbs.length > 0 && (
              <div className={styles.thumbnails}>
                {showThumbs.map((img, i) => {
                  const thumbUrl = urlFor(img)
                    .width(200)
                    .height(200)
                    .fit("crop")
                    .auto("format")
                    .url();
                  return (
                    <div key={img._key} className={styles.thumbWrap}>
                      <Image
                        src={thumbUrl}
                        alt={
                          img.alt ||
                          `${piece.title}, detail ${i + 2} of ${piece.images.length}`
                        }
                        width={100}
                        height={100}
                        className={styles.thumbnail}
                        placeholder={img.lqip ? "blur" : undefined}
                        blurDataURL={img.lqip || undefined}
                      />
                    </div>
                  );
                })}
                {extraCount > 0 && (
                  <div className={styles.thumbMore}>+{extraCount}</div>
                )}
              </div>
            )}
          </div>

          <div className={styles.metaColumn}>
            <h2 className={styles.title}>{piece.title}</h2>
            {dateText && <p className={styles.meta}>{dateText}</p>}
            {piece.materials && <p className={styles.meta}>{piece.materials}</p>}
            {dimensionsText && <p className={styles.meta}>{dimensionsText}</p>}
          </div>
        </Link>
      </article>
    </ScrollReveal>
  );
}
