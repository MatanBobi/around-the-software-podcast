import type { MetadataRoute } from "next";
import { site } from "./lib/config";
import { getFeed } from "./lib/rss";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use the latest episode's publish date as the home page's lastModified,
  // so the sitemap reflects when the site's content actually changed.
  const feed = await getFeed();
  const latest = feed?.episodes[0]?.pubDate;
  const lastModified =
    latest && !Number.isNaN(new Date(latest).getTime())
      ? new Date(latest)
      : new Date();

  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
