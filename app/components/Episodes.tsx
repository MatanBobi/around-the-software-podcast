"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { site, links } from "../lib/config";
import { type Episode, formatDate, formatDuration } from "../lib/rss";
import { ClockIcon, CalendarIcon, SpotifyIcon, HeadphonesIcon } from "./Icons";
import { usePlayer, PlayIcon, PauseIcon } from "./Player";

const PAGE_SIZE = 8;

function Meta({ ep }: { ep: Episode }) {
  return (
    <div className="episode-meta">
      {ep.pubDate ? (
        <span>
          <CalendarIcon />
          {formatDate(ep.pubDate)}
        </span>
      ) : null}
      {ep.durationSeconds ? (
        <span>
          <ClockIcon />
          {formatDuration(ep.durationSeconds)}
        </span>
      ) : null}
    </div>
  );
}

function Spotlight({ ep }: { ep: Episode }) {
  const player = usePlayer();
  const active = player.isCurrent(ep) && player.isPlaying;
  return (
    <article className="episode-spotlight">
      <div className="spotlight-art">
        <span className="spotlight-flame" aria-hidden="true">
          🔥
        </span>
        <Image src={ep.image || site.cover} alt="" width={220} height={220} />
      </div>
      <div className="spotlight-body">
        <span className="spotlight-badge">הפרק האחרון</span>
        <h3 className="spotlight-title">{ep.title}</h3>
        {ep.description ? (
          <p className="spotlight-desc">{ep.description}</p>
        ) : null}
        <Meta ep={ep} />
        <div className="spotlight-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => player.play(ep)}
          >
            {active ? <PauseIcon /> : <PlayIcon />}
            {active ? "השהיית הפרק" : "האזנה לפרק"}
          </button>
          <a
            className="btn btn-ghost"
            href={links.spotify}
            target="_blank"
            rel="noreferrer"
          >
            <SpotifyIcon />
            פתיחה ב‑Spotify
          </a>
        </div>
      </div>
    </article>
  );
}

function EpisodeRow({ ep }: { ep: Episode }) {
  const player = usePlayer();
  const isCurrent = player.isCurrent(ep);
  const active = isCurrent && player.isPlaying;
  return (
    <article className="episode" data-current={isCurrent || undefined}>
      <button
        type="button"
        className="episode-thumb-btn"
        onClick={() => player.play(ep)}
        aria-label={active ? `השהיית הפרק: ${ep.title}` : `האזנה לפרק: ${ep.title}`}
      >
        <Image
          className="episode-thumb"
          src={ep.image || site.cover}
          alt=""
          width={84}
          height={84}
        />
        <span className="episode-thumb-icon" aria-hidden="true">
          {active ? <PauseIcon /> : <PlayIcon />}
        </span>
      </button>
      <div className="episode-body">
        <button
          type="button"
          className="episode-title-btn"
          onClick={() => player.play(ep)}
        >
          <h3 className="episode-title">{ep.title}</h3>
        </button>
        {ep.description ? <p className="episode-desc">{ep.description}</p> : null}
        <Meta ep={ep} />
      </div>
      <div className="episode-play">
        <button
          type="button"
          className="play-btn"
          data-playing={active || undefined}
          onClick={() => player.play(ep)}
          aria-label={active ? `השהיית הפרק: ${ep.title}` : `האזנה לפרק: ${ep.title}`}
        >
          {active ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
    </article>
  );
}

export function Episodes({
  episodes,
  rssUrl,
}: {
  episodes: Episode[];
  rssUrl?: string;
}) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const filtered = useMemo(() => {
    if (!isSearching) return episodes;
    return episodes.filter(
      (ep) =>
        ep.title.toLowerCase().includes(q) ||
        ep.description.toLowerCase().includes(q),
    );
  }, [episodes, q, isSearching]);

  if (episodes.length === 0) {
    return (
      <section className="section" id="episodes">
        <div className="container">
          <div className="episodes-head">
            <div>
              <span className="eyebrow">ארכיון</span>
              <h2 className="section-title">כל הפרקים</h2>
            </div>
          </div>
          <div className="notice">
            לא הצלחנו לטעון את רשימת הפרקים כרגע. אפשר להאזין לכל הפרקים
            ישירות ב{" "}
            <a href={links.spotify} target="_blank" rel="noreferrer">
              Spotify
            </a>{" "}
            ולנסות שוב מאוחר יותר.
          </div>
        </div>
      </section>
    );
  }

  const latest = episodes[0];
  // When browsing (not searching) the newest episode lives in the spotlight,
  // so the list below starts from the second episode.
  const listSource = isSearching ? filtered : episodes.slice(1);
  const shown = listSource.slice(0, visible);
  const remaining = listSource.length - shown.length;

  return (
    <section className="section" id="episodes">
      <div className="container">
        <div className="episodes-head">
          <div>
            <span className="eyebrow">ארכיון</span>
            <h2 className="section-title">כל הפרקים</h2>
            <p className="section-sub">
              {episodes.length} פרקים זמינים להאזנה — חפשו לפי נושא או דפדפו
              בארכיון המלא.
            </p>
          </div>
          {rssUrl ? (
            <a
              className="btn btn-ghost"
              href={rssUrl}
              target="_blank"
              rel="noreferrer"
            >
              הרשמה ב‑RSS
            </a>
          ) : null}
        </div>

        <div className="episode-search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="חיפוש פרק לפי כותרת או תיאור…"
            aria-label="חיפוש פרקים"
          />
          {isSearching ? (
            <span className="episode-search-count">{filtered.length} תוצאות</span>
          ) : null}
        </div>

        {!isSearching ? <Spotlight ep={latest} /> : null}

        {isSearching && filtered.length === 0 ? (
          <div className="notice">
            לא נמצאו פרקים שמתאימים ל״{query}״. נסו מילת חיפוש אחרת.
          </div>
        ) : (
          <div className="episode-list">
            {shown.map((ep) => (
              <EpisodeRow key={ep.id} ep={ep} />
            ))}
          </div>
        )}

        {remaining > 0 ? (
          <div className="episode-more">
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              <HeadphonesIcon />
              הצגת {Math.min(remaining, PAGE_SIZE)} פרקים נוספים
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}
