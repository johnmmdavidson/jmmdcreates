import type { PortableTextBlock } from "@portabletext/react";

export interface SanityImage {
  _key: string;
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  alt?: string;
  caption?: string;
  lqip?: string;
  hotspot?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface Piece {
  _id: string;
  title: string;
  slug: { current: string };
  images: SanityImage[];
  startDate?: string;
  endDate: string;
  materials?: string;
  width?: number;
  height?: number;
  depth?: number;
  dimensionUnit?: string;
  description?: PortableTextBlock[];
}

export interface SiteSettings {
  artistName: string;
  artistStatement?: PortableTextBlock[];
  bio: PortableTextBlock[];
  bioImage?: SanityImage & { alt?: string; lqip?: string };
  contactEmail: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: SanityImage;
}
