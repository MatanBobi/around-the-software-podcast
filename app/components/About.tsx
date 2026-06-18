import { site, links } from "../lib/config";

const features = [
  {
    icon: "🤝",
    accent: "teal",
    title: "עבודה עם אנשים",
    text: "קולגות, מנהלים וצוותים — איך מתנהלים, מתקשרים ופותרים חיכוכים ביום‑יום בהייטק.",
  },
  {
    icon: "💬",
    accent: "pink",
    title: "סיטואציות אישיות",
    text: "סיפורים מהשטח, התלבטויות ולקחים — מהדברים שבאמת קורים מאחורי הקוד.",
  },
  {
    icon: "🔥",
    accent: "ember",
    title: "שיחות מסביב למדורה",
    text: "מתן וטל בשיחה כנה וקלילה על הצד האנושי של החיים בהייטק.",
  },
];

export function About() {
  return (
    <section className="section" id="about">
      <div className="container about-grid">
        <div>
          <span className="eyebrow">על הפודקאסט</span>
          <h2 className="section-title">{site.title}</h2>
          <p className="section-sub">{site.description}</p>
          <p className="section-sub" style={{ marginTop: 14 }}>
            עם <strong style={{ color: "var(--indigo)" }}>{site.hosts}</strong>.
          </p>
          {links.askForm ? (
            <a
              className="btn btn-primary"
              style={{ marginTop: 22 }}
              href={links.askForm}
              target="_blank"
              rel="noreferrer"
            >
              שלחו לנו שאלה
            </a>
          ) : null}
        </div>
        <div className="feature-list">
          {features.map((f) => (
            <div className="feature" key={f.title}>
              <div
                className={`feature-icon feature-icon-${f.accent}`}
                aria-hidden="true"
              >
                {f.icon}
              </div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
