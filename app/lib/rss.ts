import { XMLParser } from "fast-xml-parser";
import { site } from "./config";

export type Episode = {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  durationSeconds: number | null;
  audioUrl: string | null;
  image: string | null;
  link: string | null;
  episodeNumber: number | null;
};

export type PodcastFeed = {
  title: string;
  description: string;
  image: string | null;
  episodes: Episode[];
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function text(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (typeof node === "object" && "#text" in (node as Record<string, unknown>)) {
    return String((node as Record<string, unknown>)["#text"] ?? "");
  }
  return "";
}

function decodeEntities(str: string): string {
  return str
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function parseDuration(raw: string): number | null {
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  const parts = raw.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
  // Some feeds (e.g. Anchor) pack show notes with thousands of HTML entities,
  // which trips fast-xml-parser's entity-expansion safety limit. We decode
  // entities ourselves in `decodeEntities`, so disable parser-side expansion.
  processEntities: false,
});

/**
 * Fetches and parses the show's RSS feed.
 * Returns null if the fetch or parse fails, so the UI can degrade gracefully.
 */
export async function getFeed(): Promise<PodcastFeed | null> {
  try {
    const res = await fetch(site.rssUrl, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "around-the-software-site/1.0" },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    const data = parser.parse(xml);
    const channel = data?.rss?.channel;
    if (!channel) return null;

    const episodes: Episode[] = asArray(channel.item).map(
      (item: Record<string, unknown>, index: number) => {
        const enclosure = item.enclosure as Record<string, string> | undefined;
        const guid = item.guid as { "#text"?: string } | string | undefined;
        const epNum = parseInt(text(item["itunes:episode"]), 10);

        const descRaw =
          text(item["content:encoded"]) ||
          text(item.description) ||
          text(item["itunes:summary"]);

        const title = stripHtml(text(item.title));
        // Fallback: many feeds (incl. this one) leave <itunes:episode> empty,
        // so derive the episode number from the Hebrew title "פרק NN".
        const titleNum = title.match(/פרק\s*(\d+)/);
        const episodeNumber = !Number.isNaN(epNum)
          ? epNum
          : titleNum
            ? parseInt(titleNum[1], 10)
            : null;

        return {
          id:
            (typeof guid === "string" ? guid : guid?.["#text"]) ||
            text(item.link) ||
            `ep-${index}`,
          title,
          description: stripHtml(descRaw),
          pubDate: text(item.pubDate),
          durationSeconds: parseDuration(text(item["itunes:duration"])),
          audioUrl: enclosure?.["@_url"] || null,
          // Every episode shares the show cover, so we render the crisp
          // local artwork instead of pulling it from the feed CDN.
          image: null,
          link: text(item.link) || null,
          episodeNumber,
        };
      },
    );

    return {
      title: stripHtml(text(channel.title)) || site.title,
      description: stripHtml(
        text(channel.description) || text(channel["itunes:summary"]),
      ),
      image: null,
      episodes,
    };
  } catch {
    return null;
  }
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} שע׳ ${m} דק׳`;
  return `${m} דק׳`;
}

export function formatDate(pubDate: string): string {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    // Pin the timezone so server and client render identical strings
    // (avoids React hydration mismatches in the client episode list).
    timeZone: "Asia/Jerusalem",
  }).format(d);
}
