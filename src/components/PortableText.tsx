import {
  PortableText as BasePortableText,
  type PortableTextReactComponents,
} from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import styles from "./PortableText.module.css";

const components: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({ children }) => <p className={styles.paragraph}>{children}</p>,
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className={styles.link}
        target={value?.href?.startsWith("http") ? "_blank" : undefined}
        rel={value?.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
  },
};

interface PortableTextProps {
  value: PortableTextBlock[];
  className?: string;
}

export function PortableText({ value, className }: PortableTextProps) {
  if (!value) return null;
  return (
    <div className={className}>
      <BasePortableText value={value} components={components} />
    </div>
  );
}
