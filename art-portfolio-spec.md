# Art Portfolio Website — Design & Implementation Spec

## Overview

A personal art portfolio for a sculptor, woodworker, and fiber artist based in Seattle. The site should feel quiet, warm, and confident — like a well-lit gallery wall, not a tech product. The work speaks for itself; the site stays out of the way.

---

## Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| CMS | Sanity (free tier) | Content management, image CDN, admin studio |
| Frontend | Next.js (App Router) | Static generation, image optimization, SEO |
| Hosting | Vercel (free tier) | Deploys from GitHub, pairs natively with Next.js |
| Fonts | Google Fonts | Fraunces (variable), IBM Plex Sans |
| Images | Sanity Image CDN | Automatic resizing, format optimization (WebP/AVIF), cropping |

---

## Sanity Schema

### Piece (`piece`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | Yes | e.g., "Hum #1", "Wooden Chair" |
| `slug` | slug (auto from title) | Yes | URL-safe, e.g., `hum-1`. Used for `/work/[slug]` routes |
| `images` | array of image | Yes (min 1) | Ordered array. Each image has optional `alt` (string) and optional `caption` (string). First image in array is the primary/hero image. User can drag to reorder in Sanity Studio. |
| `startDate` | date (month/year only) | No | Store as first day of month (e.g., `2024-10-01`). Display as "October 2024". If omitted, only endDate displays. |
| `endDate` | date (month/year only) | Yes | Store as first day of month. This is the sort key for the homepage list (descending). |
| `materials` | string | No | Free text. e.g., "Walnut, hand-dyed indigo yarn" |
| `width` | number | No | Inches |
| `height` | number | No | Inches |
| `depth` | number | No | Inches. If present, piece is treated as 3D. |
| `dimensionUnit` | string | No | Default: `in`. Options: `in`, `cm`, `ft`. |
| `description` | portable text (rich text) | No | Optional short text about the piece. Keep it to a sentence or two. |

**Display logic for dimensions:**
- If width + height, no depth → display as `48" × 24"`
- If width + height + depth → display as `48" × 24" × 12"`
- If no dimensions → show nothing, don't display an empty field

**Display logic for dates:**
- If startDate and endDate are the same month/year → display as `October 2024`
- If startDate and endDate differ → display as `Oct – Dec 2024` (abbreviated month names when showing a range)
- If no startDate → display only endDate as `December 2024`

### Site Settings (`siteSettings`) — Singleton

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `artistName` | string | Yes | Displayed in header, page titles, structured data |
| `artistStatement` | portable text | No | Displayed on homepage below the artist name. A few lines max. |
| `bio` | portable text | Yes | Displayed on `/bio` page |
| `bioImage` | image | No | Optional portrait/studio photo for bio page |
| `contactEmail` | string | Yes | Displayed on bio page and footer as mailto link |
| `seoTitle` | string | No | Override for homepage `<title>`. Default: `{artistName} — Sculptor, Woodworker & Fiber Artist in Seattle` |
| `seoDescription` | string | No | Override for homepage meta description. Default: first ~155 chars of artist statement, or a sensible default. |
| `ogImage` | image | No | Default Open Graph image for social sharing. Falls back to first image of most recent piece. |

---

## Pages & Routing

### Homepage `/`

**Data:** All pieces sorted by `endDate` descending. Site settings for name + statement.

**Layout (top to bottom):**

1. **Header** (sticky — see Header component below)
2. **Hero section** — artist name (large, Fraunces) + optional artist statement (IBM Plex Sans, regular weight, muted). Generous whitespace below before first piece. The name here is larger than the sticky header name — this is the "entrance."
3. **Piece list** — all pieces, each rendered as a PieceCard component (see below), separated by 120–160px vertical space.
4. **Footer**

### Piece Detail `/work/[slug]`

**Data:** Single piece by slug. Site settings for header/footer.

**Layout:**

1. **Header** (sticky)
2. **Piece title** — large, Fraunces
3. **Metadata block** — date, materials, dimensions. Same styling as homepage card metadata.
4. **Image gallery** — all images displayed generously. On desktop, images can be laid out in a staggered/masonry-ish single-column or comfortable two-column grid depending on aspect ratio. Each image should be large enough to see detail. Clicking any image opens the lightbox.
5. **Description** — if present, displayed below images as body text.
6. **Navigation** — "← Previous" / "Next →" links to adjacent pieces (by date order). Text links, not buttons.
7. **Footer**

**SEO per piece page:**
- `<title>`: `{piece.title} — {artistName}`
- Meta description: `{materials}, {dimensions}. {description if present, truncated to 155 chars}`
- Open Graph image: first image from the piece
- JSON-LD structured data (see SEO section)

### Bio `/bio`

**Data:** Site settings bio, bioImage, contactEmail.

**Layout:**

1. **Header** (sticky)
2. **Page title** — "Bio" or just the artist name again, in Fraunces
3. **Bio image** — if present, displayed at a comfortable size. Not full-width. Maybe 50% width on desktop, floated or placed above the text.
4. **Bio text** — portable text, rendered in IBM Plex Sans. A couple paragraphs.
5. **Contact** — email as a mailto link, styled simply.
6. **Footer**

---

## Components

### Header (sticky)

- Fixed to top of viewport on scroll.
- White/warm background with subtle bottom border or shadow (very subtle — `box-shadow: 0 1px 0 rgba(0,0,0,0.06)` or similar).
- **Left:** Artist name as a text link to `/`. Set in Fraunces, moderate size (not as large as the homepage hero). Acts as home link.
- **Right:** Navigation links — "Bio". Set in IBM Plex Sans, regular weight. If we add a contact link, it goes here too. Otherwise contact lives on the bio page.
- On mobile, same layout. The navigation is just one or two text links, so no hamburger menu is needed. If it ever grows, revisit.
- **Transition on scroll:** The header should have `backdrop-filter: blur(8px)` and a slightly transparent background (e.g., `rgba(245, 242, 237, 0.9)`) so content scrolls behind it with a frosted effect. This keeps it from feeling like a hard bar cutting across the page.
- **Z-index:** Above all content, below the lightbox overlay.

### PieceCard (homepage)

Each piece in the homepage list.

**Desktop layout (min-width: 768px):**

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌───────────────────────────┐                               │
│  │                           │     Title (link)              │
│  │                           │                               │
│  │     Primary Image         │     October – December 2024   │
│  │     (click → lightbox)    │     Walnut, indigo yarn       │
│  │                           │     48" × 24"                 │
│  │                           │                               │
│  └───────────────────────────┘                               │
│  ┌──────┐ ┌──────┐ ┌──────┐                                 │
│  │thumb │ │thumb │ │thumb │                                  │
│  │(click│ │(click│ │(click│                                  │
│  │→ lb) │ │→ lb) │ │→ lb) │                                  │
│  └──────┘ └──────┘ └──────┘                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

- Image area: ~58% of card width, left-aligned
- Metadata area: ~38% of card width, right side, top-aligned with the primary image
- Primary image: largest, maintains aspect ratio, fills its column
- Thumbnails: appear below the primary image, left-aligned with it. Small (80–100px wide), with 8px gap between them. If more than 4 thumbnails, show first 4 with a `+N` indicator. Thumbnails are cropped square.
- All images are clickable → open lightbox, starting on the clicked image
- Title, date, materials, dimensions are all clickable → navigate to `/work/[slug]`
- Make the entire metadata text block the link target (one `<a>` wrapping the text group, not individual links per line). Cursor should indicate clickability.

**Typography within the card:**
- Title: Fraunces, ~24px, dark text color (`#2A2523`), medium weight
- Date: IBM Plex Sans, ~14px, lighter color (`#6B6560`)
- Materials: IBM Plex Sans, ~14px, lighter color (`#6B6560`)
- Dimensions: IBM Plex Sans, ~14px, lighter color (`#6B6560`)
- Spacing between metadata lines: ~6px

**Mobile layout (below 768px):**

```
┌──────────────────────────┐
│ ┌──────────────────────┐ │
│ │                      │ │
│ │   Primary Image      │ │
│ │                      │ │
│ └──────────────────────┘ │
│ ┌─────┐┌─────┐┌─────┐   │
│ │thumb││thumb││thumb│    │
│ └─────┘└─────┘└─────┘   │
│                          │
│ Title                    │
│ October – December 2024  │
│ Walnut, indigo yarn      │
│ 48" × 24"                │
└──────────────────────────┘
```

- Primary image: full width
- Thumbnails: horizontal scroll row if they overflow, same small size
- Metadata: below images, left-aligned, same typographic hierarchy

### Lightbox

Triggered by clicking any image (homepage card or piece detail page).

**Behavior:**
- Overlay covers full viewport: background `rgba(20, 18, 16, 0.92)` (dark warm black, slightly transparent)
- Image centered, scaled to fit viewport with padding (max 90vw, max 85vh)
- **Navigation:** left/right arrows on desktop (keyboard arrow keys also work). Swipe on mobile/touch. Arrows are minimal — thin, white, positioned at horizontal edges of viewport.
- **Close:** X button (top-right), or press Escape, or click outside the image area
- **Caption:** piece title and image caption (if any) displayed below the image in small white text (IBM Plex Sans, ~13px, `rgba(255,255,255,0.7)`)
- **Counter:** `2 / 5` style indicator, small, below caption or in corner
- **Transitions:** image crossfades between slides (200ms ease). Overlay fades in on open (300ms), fades out on close (200ms).
- **Scroll lock:** body scroll is disabled while lightbox is open
- **Z-index:** above everything including the sticky header
- **Preloading:** preload adjacent images (prev/next) for instant transitions
- **Accessibility:** trap focus inside lightbox while open. Close button and nav arrows are keyboard accessible. `aria-modal="true"`, `role="dialog"`. Images have alt text.

### Footer

- Minimal. Centered or left-aligned.
- Contact email as a `mailto:` link
- `© {currentYear} {artistName}`
- Set in IBM Plex Sans, small (~13px), lighter color
- Generous top margin separating it from the last piece (80–100px)

---

## Scroll Animation

- **Library:** Use `framer-motion` or a lightweight intersection observer approach. Framer-motion is heavier but integrates well with Next.js and React. If bundle size is a concern, a custom hook using `IntersectionObserver` with CSS transitions is fine.
- **Animation:** Each PieceCard fades in and translates up. `opacity: 0 → 1`, `translateY: 20px → 0`. Duration: 450ms. Easing: `ease-out` (or `cubic-bezier(0.25, 0.1, 0.25, 1)`).
- **Trigger:** When the card's top edge is ~85% down the viewport (i.e., 15% visible).
- **Once only:** Each card animates in once. Once visible, it stays visible — no animate-out on scroll up.
- **First visible card on page load:** No animation. It's already in view; it should simply be there.
- **Mobile:** Same animation, same timing. No difference.

---

## Visual Design Tokens

```css
:root {
  /* Colors */
  --color-bg: #F5F2ED;
  --color-text: #2A2523;
  --color-text-muted: #6B6560;
  --color-text-light: #9B9590;
  --color-border: rgba(42, 37, 35, 0.08);
  --color-overlay: rgba(20, 18, 16, 0.92);

  /* Typography — Families */
  --font-display: 'Fraunces', serif;
  --font-body: 'IBM Plex Sans', sans-serif;

  /* Typography — Sizes (desktop) */
  --text-hero: 3rem;        /* Artist name on homepage hero */
  --text-header: 1.25rem;   /* Artist name in sticky header */
  --text-title: 1.5rem;     /* Piece titles */
  --text-body: 1rem;        /* Body text, artist statement */
  --text-meta: 0.875rem;    /* Date, materials, dimensions */
  --text-caption: 0.8125rem; /* Lightbox captions, footer */

  /* Typography — Sizes (mobile, ≤768px) */
  /* Scale everything down ~15%:
     --text-hero: 2.25rem
     --text-title: 1.25rem
     --text-body: 1rem (unchanged)
     --text-meta: 0.8125rem
  */

  /* Spacing */
  --space-piece-gap: 140px;       /* Vertical gap between piece cards */
  --space-hero-bottom: 100px;     /* Below hero section, above first piece */
  --space-page-x: clamp(20px, 5vw, 80px); /* Horizontal page padding, responsive */
  --space-footer-top: 100px;

  /* Layout */
  --max-content-width: 1100px;    /* Max width of content area */
  --card-image-ratio: 0.58;       /* Image area takes ~58% of card width */
  --card-gap: 40px;               /* Horizontal gap between image and metadata in card */

  /* Transitions */
  --transition-fade: 450ms ease-out;
  --transition-lightbox: 300ms ease;

  /* Border radius */
  --radius-thumbnail: 2px;        /* Barely there — just softens the edge */
  --radius-none: 0;               /* Primary images: no radius */
}
```

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| ≥1024px | Full desktop layout. Content max-width 1100px, centered. |
| 768px–1023px | Tablet. Same layout as desktop but card image ratio shifts to ~55%, metadata text may wrap more. Reduce `--space-piece-gap` to 100px. |
| <768px | Mobile. Cards stack vertically (image above metadata). Hero text size decreases. `--space-piece-gap` reduces to 80px. Thumbnails become horizontal scroll row. |

---

## SEO Implementation

### Page Titles
- Homepage: `{artistName} — Sculptor, Woodworker & Fiber Artist in Seattle` (or custom via siteSettings.seoTitle)
- Piece detail: `{piece.title} — {artistName}`
- Bio: `About {artistName} — Seattle Artist`

### Meta Descriptions
- Homepage: artist statement excerpt or custom seoDescription (max 155 chars)
- Piece detail: auto-generated from piece metadata. Format: `"{title}" — {materials}. {dimensions}. {description excerpt if present}` — truncated to 155 chars.
- Bio: first ~155 chars of bio text

### JSON-LD Structured Data

**Homepage — Person schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "{artistName}",
  "url": "{siteUrl}",
  "jobTitle": "Artist",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Seattle",
    "addressRegion": "WA"
  }
}
```

**Each piece detail page — VisualArtwork schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "VisualArtwork",
  "name": "{piece.title}",
  "creator": {
    "@type": "Person",
    "name": "{artistName}"
  },
  "artMedium": "{piece.materials}",
  "width": "{piece.width} {piece.dimensionUnit}",
  "height": "{piece.height} {piece.dimensionUnit}",
  "depth": "{piece.depth} {piece.dimensionUnit}",
  "dateCreated": "{piece.endDate as YYYY-MM}",
  "image": "{first image URL}"
}
```

### Additional SEO
- Generate a `sitemap.xml` that includes `/`, `/bio`, and all `/work/[slug]` pages. Next.js can do this automatically.
- Add a `robots.txt` allowing all crawlers.
- All images must have `alt` text. If not provided in Sanity, auto-generate from piece title + image position (e.g., "Hum #1, detail view 2 of 4").
- Use Next.js `<Image>` component for automatic WebP/AVIF serving, lazy loading, and responsive `srcset`.
- Ensure all pages are server-rendered or statically generated (not client-only) so crawlers see full content.

---

## Accessibility

- All images: meaningful `alt` text (see SEO section)
- Lightbox: focus trap, keyboard navigation (arrows, escape), `role="dialog"`, `aria-modal="true"`
- Sticky header: navigation links are semantic `<a>` tags, keyboard navigable
- Color contrast: `#2A2523` on `#F5F2ED` = ratio ~12:1 (exceeds WCAG AAA). `#6B6560` on `#F5F2ED` = ratio ~4.8:1 (passes WCAG AA for normal text).
- `#9B9590` (text-light) on `#F5F2ED` = ratio ~3.1:1. **Use only for decorative/supplementary text, not essential content.** If used for anything meaningful, bump to `--color-text-muted` instead.
- Scroll animations: respect `prefers-reduced-motion`. If the user has reduced motion enabled, skip the fade/translate and show cards immediately.
- Semantic HTML: `<header>`, `<main>`, `<footer>`, `<article>` for each piece, `<nav>` for navigation.
- Skip-to-content link (visually hidden, visible on focus) at the top of the page.

---

## Image Handling

### Sanity Image Pipeline
- Upload images at highest reasonable resolution (Sanity handles resizing)
- Use Sanity's `@sanity/image-url` package to generate optimized URLs with specific widths
- Serve responsive images using `srcset`:
  - Primary image on homepage card: widths 600, 900, 1200
  - Thumbnails: width 200
  - Lightbox: widths 1200, 1800, 2400
  - Piece detail page images: widths 800, 1200, 1600
- Format: let Sanity auto-negotiate (it serves WebP/AVIF to supporting browsers)
- Lazy load all images below the fold. First piece's primary image should be eager-loaded.
- Use Sanity's LQIP (Low Quality Image Placeholder) for blur-up effect while images load.

### Image Ordering in Sanity Studio
- The `images` array field should use Sanity's default drag-and-drop reordering
- First image in the array = primary/hero image
- No separate "primary image" field needed — position in array determines it

---

## Sanity Studio Customization

Keep the Studio minimal and clear for a non-technical user:

- **Pieces list view:** Show thumbnail of first image, title, and formatted endDate. Sort by endDate descending by default.
- **Site Settings:** Single document, always accessible from the sidebar. Group fields into sections: "Identity" (name, statement), "Bio", "Contact", "SEO".
- **Image upload:** Sanity's built-in image upload supports drag-and-drop and paste. No customization needed.
- **Portable text toolbar:** Limit rich text options to: bold, italic, links. No headers, no lists, no custom blocks. The artist statement and bio should be simple prose.

---

## Deployment & Build

- **Build trigger:** Sanity webhook on content publish → triggers Vercel rebuild. This means the site is statically generated but updates within ~30 seconds of publishing in Sanity.
- **Environment variables needed:**
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET` (usually `production`)
  - `SANITY_API_TOKEN` (read token, for build-time data fetching)
- **Preview:** Optionally set up Sanity's preview mode so edits can be seen before publishing. Nice to have, not essential for v1.

---

## Project Structure (suggested)

```
/
├── sanity/                    # Sanity Studio (can be in same repo)
│   ├── schemas/
│   │   ├── piece.ts
│   │   └── siteSettings.ts
│   ├── sanity.config.ts
│   └── sanity.cli.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout: fonts, header, footer
│   │   ├── page.tsx           # Homepage
│   │   ├── work/
│   │   │   └── [slug]/
│   │   │       └── page.tsx   # Piece detail
│   │   └── bio/
│   │       └── page.tsx       # Bio page
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── PieceCard.tsx      # Homepage card
│   │   ├── Lightbox.tsx
│   │   ├── PieceGallery.tsx   # Detail page image layout
│   │   ├── ScrollReveal.tsx   # Scroll animation wrapper
│   │   └── PortableText.tsx   # Sanity rich text renderer
│   ├── lib/
│   │   ├── sanity.client.ts   # Sanity client setup
│   │   ├── sanity.queries.ts  # GROQ queries
│   │   └── sanity.image.ts    # Image URL builder
│   └── styles/
│       └── globals.css        # CSS variables, base styles
├── next.config.js
└── package.json
```

---

## What's Out of Scope for V1

- E-commerce / purchasing
- Blog or news section
- Multiple galleries or filtering by medium
- Dark mode (can be added later)
- Analytics (add after launch — Vercel Analytics or Plausible)
- Contact form (email link is sufficient)
- Social media links
