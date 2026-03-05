import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { LightboxProvider } from "@/components/LightboxProvider";
import "@/styles/globals.css";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-body",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Art Portfolio",
  description: "Sculptor, Woodworker & Fiber Artist in Seattle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fraunces.variable} ${ibmPlexSans.variable}`}>
        <LightboxProvider>{children}</LightboxProvider>
      </body>
    </html>
  );
}
