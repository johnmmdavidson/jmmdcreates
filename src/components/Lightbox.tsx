"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.image";
import type { SanityImage } from "@/lib/sanity.types";
import styles from "./Lightbox.module.css";

interface LightboxImage {
  image: SanityImage;
  pieceTitle: string;
}

interface LightboxProps {
  images: LightboxImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Lightbox({
  images,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef(0);

  const current = images[currentIndex];
  const total = images.length;

  // Lock body scroll
  useEffect(() => {
    document.body.classList.add("lightbox-open");
    closeButtonRef.current?.focus();
    return () => {
      document.body.classList.remove("lightbox-open");
    };
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowRight":
          onNext();
          break;
        case "ArrowLeft":
          onPrev();
          break;
      }
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus trap
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableEls = dialog.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusableEls[0];
    const last = focusableEls[focusableEls.length - 1];

    function trapFocus(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    dialog.addEventListener("keydown", trapFocus);
    return () => dialog.removeEventListener("keydown", trapFocus);
  }, []);

  // Preload adjacent images
  useEffect(() => {
    const indices = [
      (currentIndex + 1) % total,
      (currentIndex - 1 + total) % total,
    ];
    indices.forEach((i) => {
      if (i !== currentIndex && images[i]) {
        const img = new window.Image();
        img.src = urlFor(images[i].image).width(1800).auto("format").url();
      }
    });
  }, [currentIndex, images, total]);

  // Touch/swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) onNext();
      else onPrev();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const imageUrl = urlFor(current.image).width(1800).auto("format").url();
  const altText =
    current.image.alt ||
    `${current.pieceTitle}, image ${currentIndex + 1} of ${total}`;

  return (
    <div
      ref={dialogRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        ref={closeButtonRef}
        className={styles.close}
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {total > 1 && (
        <>
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={onPrev}
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={onNext}
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div className={styles.imageContainer}>
        <Image
          src={imageUrl}
          alt={altText}
          width={1800}
          height={1200}
          className={styles.image}
          sizes="90vw"
          priority
        />
      </div>

      <div className={styles.caption}>
        <span className={styles.captionTitle}>{current.pieceTitle}</span>
        {current.image.caption && (
          <span className={styles.captionText}> — {current.image.caption}</span>
        )}
        {total > 1 && (
          <span className={styles.counter}>
            {currentIndex + 1} / {total}
          </span>
        )}
      </div>
    </div>
  );
}
