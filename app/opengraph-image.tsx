import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { site, palette } from "./lib/config";

// Route segment config — generated at build time.
export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontsDir = join(process.cwd(), "public", "fonts");
const publicDir = join(process.cwd(), "public");

function font(file: string) {
  return readFileSync(join(fontsDir, file));
}

// Satori (next/og) has no BiDi/RTL reordering — it lays glyphs out
// left-to-right, which visually reverses Hebrew. We pre-reverse each
// Hebrew run (kept on a single line via nowrap) so it renders correctly.
// Latin runs (e.g. the domain) are left untouched and rendered LTR.
function rtl(value: string): string {
  return [...value].reverse().join("");
}

export default async function OpengraphImage() {
  // Embed the square cover (lavender background + campfire art + Hebrew
  // wordmark as vector paths) as a data URI so Satori can rasterize it.
  const svg = readFileSync(join(publicDir, "thumbnail.svg"), "utf-8");
  const cover = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  const hosts = site.hosts.replace(/\s*&\s*/g, " · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "56px 76px",
          gap: "64px",
          fontFamily: "Heebo",
          // The site's signature violet (--indigo), kept dominant.
          backgroundImage: `linear-gradient(145deg, ${palette.periwinkle} 0%, ${palette.indigo} 50%, ${palette.indigoDeep} 100%)`,
        }}
      >
        {/* Square cover art (accent, on the left) */}
        <img
          src={cover}
          width={470}
          height={470}
          style={{
            borderRadius: 32,
            boxShadow: "0 24px 60px rgba(0,0,0,0.32)",
          }}
        />

        {/* Hebrew brand panel (right-aligned for RTL reading) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right",
            flex: 1,
            color: "#ffffff",
          }}
        >
          <div style={{ fontSize: 34, fontWeight: 800, color: palette.gold }}>
            {rtl("פודקאסט")}
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.1,
              marginTop: 12,
              whiteSpace: "nowrap",
            }}
          >
            {rtl(site.title)}
          </div>
          <div
            style={{
              width: 110,
              height: 9,
              borderRadius: 999,
              background: palette.coral,
              margin: "30px 0",
            }}
          />
          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: palette.lavenderSoft,
              whiteSpace: "nowrap",
            }}
          >
            {rtl(hosts)}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 500,
              color: palette.lavender,
              marginTop: 18,
            }}
          >
            {site.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Heebo", data: font("Heebo-800.ttf"), weight: 800, style: "normal" },
        { name: "Heebo", data: font("Heebo-Latin-800.ttf"), weight: 800, style: "normal" },
        { name: "Heebo", data: font("Heebo-500.ttf"), weight: 500, style: "normal" },
        { name: "Heebo", data: font("Heebo-Latin-500.ttf"), weight: 500, style: "normal" },
      ],
    },
  );
}
