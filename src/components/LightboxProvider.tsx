"use client";

import { createContext, useContext, useState, useCallback } from "react";
import type { SanityImage } from "@/lib/sanity.types";
import { Lightbox } from "./Lightbox";

interface LightboxImage {
  image: SanityImage;
  pieceTitle: string;
}

interface LightboxContextValue {
  open: (images: LightboxImage[], startIndex: number) => void;
}

const LightboxContext = createContext<LightboxContextValue>({
  open: () => {},
});

export function useLightbox() {
  return useContext(LightboxContext);
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((imgs: LightboxImage[], startIndex: number) => {
    setImages(imgs);
    setCurrentIndex(startIndex);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {isOpen && (
        <Lightbox
          images={images}
          currentIndex={currentIndex}
          onClose={close}
          onNext={goNext}
          onPrev={goPrev}
        />
      )}
    </LightboxContext.Provider>
  );
}
