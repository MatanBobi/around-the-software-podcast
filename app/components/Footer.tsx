import { site, links } from "../lib/config";
import { SpotifyIcon, RssIcon, ApplePodcastsIcon } from "./Icons";

export function Subscribe() {
  return (
    <section className="section">
      <div className="container">
        <div className="subscribe">
          <h2>אל תפספסו פרק</h2>
          <p>הירשמו והאזינו בכל אפליקציית פודקאסטים שאתם אוהבים.</p>
          <div className="subscribe-actions">
            <a className="btn btn-spotify" href={links.spotify} target="_blank" rel="noreferrer">
              <SpotifyIcon />
              Spotify
            </a>
            {links.applePodcasts ? (
              <a className="btn btn-apple" href={links.applePodcasts} target="_blank" rel="noreferrer">
                <ApplePodcastsIcon />
                Apple Podcasts
              </a>
            ) : null}
            {links.rss ? (
              <a className="btn btn-ghost" href={links.rss} target="_blank" rel="noreferrer">
                <RssIcon />
                RSS
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <span className="brand-name">{site.title}</span>
        <nav className="footer-links">
          <a href="#episodes">פרקים</a>
          <a href="#about">על הפודקאסט</a>
          <a href={links.spotify} target="_blank" rel="noreferrer">
            Spotify
          </a>
          {links.applePodcasts ? (
            <a href={links.applePodcasts} target="_blank" rel="noreferrer">
              Apple Podcasts
            </a>
          ) : null}
        </nav>
        <span className="copyright">
          © {new Date().getFullYear()} {site.title}
        </span>
      </div>
    </footer>
  );
}
