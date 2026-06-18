import Image from "next/image";
import { site, links } from "../lib/config";
import { SpotifyIcon } from "./Icons";

export function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <a className="brand" href="#top" aria-label={site.title}>
          <Image src={site.cover} alt={site.title} width={40} height={40} />
          <span className="brand-name">{site.title}</span>
        </a>
        <nav className="nav">
          <a className="nav-hide" href="#episodes">
            פרקים
          </a>
          <a className="nav-hide" href="#about">
            על הפודקאסט
          </a>
          <a className="nav-cta" href={links.spotify} target="_blank" rel="noreferrer">
            <SpotifyIcon />
            <span>האזינו</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
