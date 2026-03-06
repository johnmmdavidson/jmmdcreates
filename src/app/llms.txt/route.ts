import { getSiteSettings, getAllPieces } from "@/lib/sanity.queries";
import { portableTextToPlain } from "@/lib/portableTextToPlain";
import { formatDateRange } from "@/lib/format";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const settings = await getSiteSettings();
  const pieces = await getAllPieces();

  const artistName = settings?.artistName || "Artist";
  const statement = portableTextToPlain(settings?.artistStatement);

  const lines: string[] = [
    `# ${artistName}`,
    "",
    `> ${statement || "Artist portfolio"}`,
    "",
    `This is the personal portfolio of ${artistName}, a sculptor, woodworker, and fiber artist based in Seattle.`,
    "",
    "## Site Structure",
    "",
    `- [Home](${siteUrl}/)`,
    `- [Bio](${siteUrl}/bio)`,
    "",
    "## Work",
    "",
  ];

  for (const piece of pieces) {
    const slug = piece.slug.current;
    const date = formatDateRange(piece.startDate, piece.endDate);
    const meta = [date, piece.materials].filter(Boolean).join(" | ");
    lines.push(`- [${piece.title}](${siteUrl}/work/${slug})${meta ? `: ${meta}` : ""}`);
  }

  lines.push(
    "",
    "## Further Reading",
    "",
    `- [Full content for LLMs](${siteUrl}/llms-full.txt)`,
  );

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
