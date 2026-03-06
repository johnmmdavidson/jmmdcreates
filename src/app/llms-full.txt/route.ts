import { getSiteSettings, getAllPieces } from "@/lib/sanity.queries";
import { portableTextToPlain } from "@/lib/portableTextToPlain";
import { formatDateRange, formatDimensions } from "@/lib/format";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const settings = await getSiteSettings();
  const pieces = await getAllPieces();

  const artistName = settings?.artistName || "Artist";
  const statement = portableTextToPlain(settings?.artistStatement);
  const bio = portableTextToPlain(settings?.bio);

  const lines: string[] = [
    `# ${artistName}`,
    "",
    `> ${statement || "Artist portfolio"}`,
    "",
    `This is the personal portfolio of ${artistName}, a sculptor, woodworker, and fiber artist based in Seattle.`,
    "",
    "---",
    "",
    "## Bio",
    "",
    bio || "No bio available.",
    "",
    ...(settings?.contactEmail
      ? [`Contact: ${settings.contactEmail}`, ""]
      : []),
    "---",
    "",
    "## Work",
    "",
  ];

  for (const piece of pieces) {
    const slug = piece.slug.current;
    const date = formatDateRange(piece.startDate, piece.endDate);
    const dims = formatDimensions(
      piece.width,
      piece.height,
      piece.depth,
      piece.dimensionUnit
    );
    const description = portableTextToPlain(piece.description);

    lines.push(`### ${piece.title}`);
    lines.push("");
    lines.push(`URL: ${siteUrl}/work/${slug}`);
    if (date) lines.push(`Date: ${date}`);
    if (piece.materials) lines.push(`Materials: ${piece.materials}`);
    if (dims) lines.push(`Dimensions: ${dims}`);
    if (description) {
      lines.push("");
      lines.push(description);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
