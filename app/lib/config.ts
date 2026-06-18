// Site configuration for the podcast "מסביב לתוכנה" (Around the Software).
// These details belong to the show and are intentionally hard-coded.

export const site = {
  title: "מסביב לתוכנה",
  titleEn: "Around the Software",
  hosts: "מתן בורנקראוט & טל יפה",
  tagline:
    "פודקאסט על כל מה שקורה ״מסביב לתוכנה״ — סופט-סקילז, יחסים עם מנהלים וקולגות, ניווט בקריירה והצד האנושי של העבודה בהייטק.",
  description:
    "מסביב לתוכנה הוא פודקאסט ישראלי שבו מתן בורנקראוט וטל יפה מדברים על הצד האנושי של העבודה בהייטק — לא על הקוד עצמו, אלא על כל מה שסביבו: סופט-סקילז, יחסים עם מנהלים וקולגות, ניווט בקריירה, ראיונות עבודה, דינמיקות צוות והתמודדויות יומיומיות מהמשרד.",
  locale: "he-IL",
  spotifyShowId: "2YQ1HQeUKYH4SduDuH1AAO",
  rssUrl: "https://anchor.fm/s/c9baaf58/podcast/rss",
  cover: "/around-full-size.png",
} as const;

export const links = {
  spotify: `https://open.spotify.com/show/${site.spotifyShowId}`,
  rss: site.rssUrl,
  applePodcasts: "https://podcasts.apple.com/podcast/id1653397369",
  askForm: "https://forms.gle/M7DcsoW1Wtov7bW57",
} as const;

// Palette sampled pixel-for-pixel from the show cover art (campfire illustration)
export const palette = {
  indigo: "#5832ea",
  indigoDeep: "#3a1fb8",
  periwinkle: "#6174ff",
  lavender: "#cbcaf4",
  lavenderSoft: "#e0e1fd",
  gold: "#ffce41",
  coral: "#ff5a36",
  pink: "#f35798",
  teal: "#5ca499",
  ink: "#15123a",
} as const;
