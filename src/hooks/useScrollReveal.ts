"use client";

import { useEffect, useRef, useState } from "react";

export function useScrollReveal(skip = false) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(skip);

  useEffect(() => {
    if (skip) return;

    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0, rootMargin: "0px 0px -15% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [skip]);

  return { ref, isVisible };
}
