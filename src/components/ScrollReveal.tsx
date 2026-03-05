"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import styles from "./ScrollReveal.module.css";

interface ScrollRevealProps {
  children: React.ReactNode;
  skip?: boolean;
}

export function ScrollReveal({ children, skip = false }: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal(skip);

  return (
    <div
      ref={ref}
      className={`${styles.wrapper} ${isVisible ? styles.visible : ""}`}
    >
      {children}
    </div>
  );
}
