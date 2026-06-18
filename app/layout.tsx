import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { site } from "./lib/config";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-heebo",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#5832ea",
};

export const metadata: Metadata = {
  title: {
    default: `${site.title} · פודקאסט`,
    template: `%s · ${site.title}`,
  },
  description: site.description,
  metadataBase: new URL("https://around-the-software.example"),
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    locale: "he_IL",
    images: [{ url: site.cover, width: 1080, height: 1080, alt: site.title }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: [site.cover],
  },
  alternates: site.rssUrl ? { types: { "application/rss+xml": site.rssUrl } } : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>{children}</body>
    </html>
  );
}
