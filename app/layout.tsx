import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { site, links } from "./lib/config";
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
  metadataBase: new URL(site.url),
  authors: [{ name: site.hosts }],
  creator: site.hosts,
  publisher: site.title,
  alternates: {
    canonical: "/",
    types: site.rssUrl
      ? { "application/rss+xml": site.rssUrl }
      : undefined,
  },
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    locale: "he_IL",
    url: site.url,
    siteName: site.title,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: site.title,
    alternateName: site.titleEn,
    description: site.description,
    url: site.url,
    inLanguage: site.locale,
    image: new URL(site.cover, site.url).toString(),
    webFeed: site.rssUrl,
    author: site.hosts.split("&").map((name) => ({
      "@type": "Person",
      name: name.trim(),
    })),
    sameAs: [links.spotify, links.applePodcasts, links.rss].filter(Boolean),
  };

  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
