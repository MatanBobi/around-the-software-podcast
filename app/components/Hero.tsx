import Image from "next/image";
import { site, links } from "../lib/config";
import { SpotifyIcon, RssIcon, HeadphonesIcon, ApplePodcastsIcon } from "./Icons";

export function Hero({ episodeCount }: { episodeCount: number | null }) {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">הצד האנושי של עולם ההייטק</span>
          <h1>{site.title}</h1>
          <p className="lead">{site.tagline}</p>

          <div className="hero-actions">
            <a className="btn btn-spotify" href={links.spotify} target="_blank" rel="noreferrer">
              <SpotifyIcon />
              האזינו ב‑Spotify
            </a>
            {links.applePodcasts ? (
              <a
                className="btn btn-apple"
                href={links.applePodcasts}
                target="_blank"
                rel="noreferrer"
              >
                <ApplePodcastsIcon />
                Apple Podcasts
              </a>
            ) : null}
            <a className="btn btn-ghost" href="#episodes">
              <HeadphonesIcon />
              לכל הפרקים
            </a>
            {links.rss ? (
              <a className="btn btn-ghost" href={links.rss} target="_blank" rel="noreferrer">
                <RssIcon />
                RSS
              </a>
            ) : null}
          </div>

          <div className="hero-stats">
            <div className="stat">
              <strong>{episodeCount ? `${episodeCount}+` : "34+"}</strong>
              <span>פרקים</span>
            </div>
            <div className="stat">
              <strong>חינם</strong>
              <span>בכל אפליקציית פודקאסטים</span>
            </div>
          </div>
        </div>

        <div className="hero-art">
          <div className="hero-art-glow" />
          <Image
            src={site.cover}
            alt={`עטיפת הפודקאסט ${site.title}`}
            width={380}
            height={380}
            priority
          />
        </div>
      </div>
    </section>
  );
}
