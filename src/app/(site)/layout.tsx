import { getSiteSettings } from "@/lib/sanity.queries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SkipToContent } from "@/components/SkipToContent";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const artistName = settings?.artistName || "Artist";
  const contactEmail = settings?.contactEmail || "";

  return (
    <>
      <SkipToContent />
      <Header artistName={artistName} />
      <main id="main-content">{children}</main>
      <Footer contactEmail={contactEmail} artistName={artistName} />
    </>
  );
}
