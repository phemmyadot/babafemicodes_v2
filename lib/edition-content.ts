import { formatPhone } from "./format";
import type { Portfolio } from "./types";

/**
 * Sanity content in the neutral shape the Electric and Kinetic editions build from.
 * Each edition's content.ts maps this onto its own cards, accents and artwork.
 */

/** The four decorative project illustrations both editions ship; projects cycle through them. */
export type Art = "flowsense" | "design-system" | "rag" | "koil";
const ARTS: Art[] = ["flowsense", "design-system", "rag", "koil"];

const FALLBACK_RESUME = "/assets/Babafemi-Adojutelegan-Resume.pdf";

/** Sentences in `text`. A sentence ends at . ! or ? followed by a space, so "Next.js" stays whole. */
export const sentences = (text: string) =>
  (text.replace(/\s+/g, " ").trim().match(/.+?[.!?](?=\s|$)|.+$/g) ?? []).map((t) => t.trim()).filter(Boolean);

/** Whole sentences from the start of `text`, stopping before `max` characters (always at least one). */
export function lead(text: string, max = 190) {
  const parts = sentences(text);
  let out = "";
  for (const p of parts) {
    if (out && `${out} ${p}`.length > max) break;
    out = out ? `${out} ${p}` : p;
  }
  return out.trim();
}

/** "8+" → { value: 8, suffix: "+" } for count-up animations; "10k+" → { 10, "k+" }. */
function parseStat(value: string, unit?: string) {
  const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  return { value: m ? Number(m[1]) : 0, suffix: (m ? m[2] : "") + (unit ?? ""), display: value + (unit ?? "") };
}

export function editionContent({ settings: s, metrics, projects, skills, experience, credentials }: Portfolio) {
  const digits = (s.phone ?? "").replace(/\D/g, "");
  return {
    location: s.location ?? "",
    lede: lead(s.bio[0] ?? s.tagline ?? "", 220),
    contact: {
      email: s.email,
      phone: s.phone ? formatPhone(s.phone) : "",
      phoneHref: digits ? `+${digits.length === 10 ? `1${digits}` : digits}` : "",
      // ?dl= makes Sanity's CDN serve a download, since `download` is ignored cross-origin.
      resume: s.resumeUrl ? `${s.resumeUrl}?dl=Babafemi-Adojutelegan-Resume.pdf` : FALLBACK_RESUME,
      github: s.githubUrl ?? "",
      linkedin: s.linkedinUrl ?? "",
    },
    stats: metrics.map((m) => ({ ...parseStat(m.value, m.unit), label: m.label })),
    projects: projects.map((p, i) => {
      const body = p.body
        .map((b) => (Array.isArray(b.children) ? b.children.map((c) => ("text" in c ? String(c.text) : "")).join("") : ""))
        .filter((t) => t.trim());
      const summary = p.summary ?? "";
      return {
        id: p.slug,
        n: i + 1,
        art: ARTS[i % ARTS.length],
        title: p.title,
        category: p.domain ?? "Project",
        short: lead(summary),
        // Dossier "what I built": the written body when there is one, otherwise the description's sentences.
        bullets: body.length ? body : sentences(summary),
        outcome: p.metrics[0] ?? lead(summary, 120),
        metric: p.metrics[0] ? p.domain ?? "Result" : p.domain ?? "Project",
        metricLabel: p.metrics[0] ?? `${p.techStack.length} technologies`,
        tags: p.techStack,
        role: p.role,
        repo: p.githubUrl,
      };
    }),
    skills: skills.map((g) => ({ title: g.title, skills: g.skills })),
    experience: experience.map((e) => ({
      company: e.company,
      role: e.role,
      description: e.highlights[0] ?? "",
      tags: e.techStack.slice(0, 5),
    })),
    credentials: credentials
      .filter((c) => c.kind === "certification")
      .map((c) => ({
        title: c.title,
        issuer: [c.issuer, c.code].filter(Boolean).join(" · "),
        href: c.verifyUrl ?? "",
        linkLabel: "Verify credential",
      })),
  };
}

export type EditionContent = ReturnType<typeof editionContent>;
