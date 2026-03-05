"use client";

import Image from "next/image";
import Link from "next/link";
import { urlFor } from "@/lib/sanity.image";
import { formatDateRange, formatDimensions } from "@/lib/format";
import { useLightbox } from "./LightboxProvider";
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
  const { open } = useLightbox();
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

  const lightboxImages = piece.images.map((img) => ({
    image: img,
    pieceTitle: piece.title,
  }));

  const handleImageClick = (index: number) => {
    open(lightboxImages, index);
  };

  const primaryUrl = urlFor(primaryImage).width(1200).auto("format").url();
  const primaryAlt =
    primaryImage.alt || `${piece.title}, primary image`;

  return (
    <ScrollReveal skip={skipAnimation}>
      <article className={styles.card}>
        <div className={styles.imageColumn}>
          <button
            className={styles.primaryImageButton}
            onClick={() => handleImageClick(0)}
            aria-label={`View ${piece.title} in lightbox`}
          >
            <Image
              src={primaryUrl}
              alt={primaryAlt}
              width={900}
              height={600}
              sizes="(min-width: 768px) 58vw, 100vw"
              className={styles.primaryImage}
              priority={priority}
              placeholder={primaryImage.lqip ? "blur" : undefined}
              blurDataURL={primaryImage.lqip || undefined}
            />
          </button>

          {showThumbs.length > 0 && (
            <div className={styles.thumbnails}>
              {showThumbs.map((img, i) => {
                const thumbUrl = urlFor(img)
                  .width(200)
                  .height(200)
                  .auto("format")
                  .url();
                return (
                  <button
                    key={img._key}
                    className={styles.thumbButton}
                    onClick={() => handleImageClick(i + 1)}
                    aria-label={`View image ${i + 2} of ${piece.images.length}`}
                  >
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
                  </button>
                );
              })}
              {extraCount > 0 && (
                <button
                  className={styles.thumbMore}
                  onClick={() => handleImageClick(MAX_THUMBS + 1)}
                  aria-label={`View ${extraCount} more images`}
                >
                  +{extraCount}
                </button>
              )}
            </div>
          )}
        </div>

        <Link
          href={`/work/${piece.slug.current}`}
          className={styles.metaColumn}
        >
          <h2 className={styles.title}>{piece.title}</h2>
          {dateText && <p className={styles.meta}>{dateText}</p>}
          {piece.materials && <p className={styles.meta}>{piece.materials}</p>}
          {dimensionsText && <p className={styles.meta}>{dimensionsText}</p>}
        </Link>
      </article>
    </ScrollReveal>
  );
}
