import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Episodes } from "./components/Episodes";
import { PlayerProvider } from "./components/Player";
import { About } from "./components/About";
import { Subscribe, Footer } from "./components/Footer";
import { getFeed } from "./lib/rss";
import { site } from "./lib/config";

export const revalidate = 3600;

export default async function HomePage() {
  const feed = await getFeed();
  const episodes = feed?.episodes ?? [];

  return (
    <>
      <Header />
      <main>
        <Hero episodeCount={episodes.length || null} />
        <PlayerProvider>
          <Episodes episodes={episodes} rssUrl={site.rssUrl} />
        </PlayerProvider>
        <About />
        <Subscribe />
      </main>
      <Footer />
    </>
  );
}
