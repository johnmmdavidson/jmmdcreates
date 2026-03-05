"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity.image";
import { useLightbox } from "./LightboxProvider";
import type { SanityImage } from "@/lib/sanity.types";
import styles from "./PieceGallery.module.css";

interface PieceGalleryProps {
  images: SanityImage[];
  pieceTitle: string;
}

export function PieceGallery({ images, pieceTitle }: PieceGalleryProps) {
  const { open } = useLightbox();

  const lightboxImages = images.map((img) => ({
    image: img,
    pieceTitle,
  }));

  return (
    <div className={styles.gallery}>
      {images.map((img, i) => {
        const url = urlFor(img).width(1600).auto("format").url();
        const alt =
          img.alt || `${pieceTitle}, image ${i + 1} of ${images.length}`;

        return (
          <button
            key={img._key}
            className={styles.imageButton}
            onClick={() => open(lightboxImages, i)}
            aria-label={`View ${alt} in lightbox`}
          >
            <Image
              src={url}
              alt={alt}
              width={1600}
              height={1067}
              sizes="(min-width: 768px) 50vw, 100vw"
              className={styles.image}
              priority={i === 0}
              placeholder={img.lqip ? "blur" : undefined}
              blurDataURL={img.lqip || undefined}
            />
            {img.caption && (
              <span className={styles.caption}>{img.caption}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
