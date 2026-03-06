import type { PortableTextBlock } from "@portabletext/react";

export function portableTextToPlain(blocks?: PortableTextBlock[]): string {
  if (!blocks) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) return "";
      return (block.children as { text?: string }[])
        .map((child) => child.text || "")
        .join("");
    })
    .filter(Boolean)
    .join("\n\n");
}
