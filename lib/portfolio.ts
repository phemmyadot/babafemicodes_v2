import "server-only";
import type { PortableTextBlock } from "@portabletext/types";
import seed from "@/content/portfolio.json";
import { sanityClient } from "./sanity/client";
import { PORTFOLIO_QUERY, PORTFOLIO_TAG } from "./sanity/queries";
import type { Credential, Experience, Metric, Portfolio, Project, Settings, Signal, SkillGroup } from "./types";

/** ISR window; on-demand revalidation via webhook makes publishes show up immediately. */
export const REVALIDATE_SECONDS = 3600;

const SIGNALS: Signal[] = ["rising", "steady", "spiky", "wave"];

export function toBlocks(paragraphs: string[], keyPrefix: string): PortableTextBlock[] {
  return paragraphs.map((text, i) => ({
    _type: "block",
    _key: `${keyPrefix}-${i}`,
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: `${keyPrefix}-${i}-s`, text, marks: [] }],
  }));
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const clean = (list: string[] | null | undefined) => (list ?? []).map((s) => s?.trim()).filter(Boolean) as string[];

/** "AWS Certified Solutions Architect Associate (SAA-C03) | Amazon Web Services" → parts. */
export function parseCertLabel(label: string) {
  const [main, issuer] = label.split("|").map((s) => s.trim());
  const code = main.match(/\(([^)]+)\)\s*$/)?.[1];
  return { title: code ? main.replace(/\s*\([^)]+\)\s*$/, "") : main, code, issuer: issuer || undefined };
}

const fallback: Omit<Portfolio, "source"> = {
  settings: seed.settings,
  metrics: seed.metrics.map((m, i) => ({ ...m, id: `metric-${i}`, signal: m.signal as Signal })),
  skills: seed.skills.map((g) => ({ ...g, id: slugify(g.title) })),
  projects: seed.projects.map((p) => ({
    ...p,
    id: p.slug,
    body: toBlocks(p.body, p.slug),
  })),
  experience: seed.experience.map((e, i) => ({ ...e, id: `exp-${i}` })),
  credentials: seed.credentials.map((c, i) => ({ ...c, id: `cred-${i}`, kind: c.kind as Credential["kind"] })),
};

interface SanityProfile {
  firstName?: string;
  lastName?: string;
  headline?: string;
  tagline?: string;
  titles?: string[];
  bio?: string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  hashnode?: string;
  location?: string;
  workStatus?: string;
  openToWork?: boolean;
  avatarUrl?: string;
  resumeUrl?: string;
  stats?: Array<{ id: string; value?: string; label?: string; unit?: string; detail?: string; signal?: Signal }>;
  certifications?: Array<{ id: string; label?: string; url?: string }>;
  education?: Array<{ id: string; degree?: string; institution?: string; year?: string }>;
}

interface SanityResult {
  profile: SanityProfile | null;
  skills: SkillGroup[];
  projects: Array<Omit<Project, "slug"> & { slug: string | null }>;
  experience: Experience[];
}

/** Drop null/empty fields so they don't overwrite fallback values. */
function compact<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined && v !== "" && !(Array.isArray(v) && !v.length)),
  ) as Partial<T>;
}

const orFallback = <T,>(list: T[] | null | undefined, fb: T[]) => (list && list.length ? list : fb);

function mapSettings(p: SanityProfile | null): Partial<Settings> {
  if (!p) return {};
  return compact({
    name: [p.firstName, p.lastName].filter(Boolean).join(" "),
    title: p.headline ?? p.titles?.[0],
    titles: clean(p.titles),
    tagline: p.tagline,
    bio: clean(p.bio),
    avatarUrl: p.avatarUrl,
    location: p.location,
    workStatus: p.workStatus,
    openToWork: p.openToWork,
    email: p.email,
    phone: p.phone,
    githubUrl: p.github,
    linkedinUrl: p.linkedin,
    blogUrl: p.hashnode,
    resumeUrl: p.resumeUrl,
  });
}

function mapMetrics(p: SanityProfile | null): Metric[] {
  return (p?.stats ?? [])
    .filter((s) => s.value && s.label)
    .map((s, i) => ({
      id: s.id,
      value: s.value!,
      label: s.label!,
      unit: s.unit,
      detail: s.detail,
      signal: s.signal ?? SIGNALS[i % SIGNALS.length],
    }));
}

function mapCredentials(p: SanityProfile | null): Credential[] {
  const certs: Credential[] = (p?.certifications ?? [])
    .filter((c) => c.label)
    .map((c) => ({ id: c.id, kind: "certification", verifyUrl: c.url, ...parseCertLabel(c.label!) }));
  const edu: Credential[] = (p?.education ?? [])
    .filter((e) => e.degree)
    .map((e) => ({ id: e.id, kind: "education", title: e.degree!, issuer: e.institution, year: e.year }));
  return [...certs, ...edu];
}

function mapProjects(list: SanityResult["projects"]): Project[] {
  const seen = new Set<string>();
  return list.map((p) => {
    let slug = p.slug || slugify(p.title) || p.id;
    if (seen.has(slug)) slug = `${slug}-${p.id.slice(0, 4)}`;
    seen.add(slug);
    return { ...p, slug, techStack: clean(p.techStack), metrics: clean(p.metrics) };
  });
}

/**
 * Fetches all portfolio content from Sanity. Any section that is empty in the CMS —
 * or the whole payload, if Sanity is unconfigured or unreachable — falls back to
 * the bundled seed content so the site never renders blank.
 */
export async function getPortfolio(): Promise<Portfolio> {
  if (!sanityClient) return { ...fallback, source: "fallback" };

  try {
    const data = await sanityClient.fetch<SanityResult>(
      PORTFOLIO_QUERY,
      {},
      { next: { revalidate: REVALIDATE_SECONDS, tags: [PORTFOLIO_TAG] } },
    );

    return {
      settings: { ...fallback.settings, ...mapSettings(data.profile) },
      metrics: orFallback(mapMetrics(data.profile), fallback.metrics),
      skills: orFallback(
        data.skills.map((g) => ({ ...g, skills: clean(g.skills) })).filter((g) => g.skills.length),
        fallback.skills,
      ),
      projects: orFallback(mapProjects(data.projects), fallback.projects),
      experience: orFallback(
        data.experience.map((e) => ({ ...e, highlights: clean(e.highlights), techStack: clean(e.techStack) })),
        fallback.experience,
      ),
      credentials: orFallback(mapCredentials(data.profile), fallback.credentials),
      source: "sanity",
    };
  } catch (err) {
    console.error("[portfolio] Sanity fetch failed, serving fallback content:", err);
    return { ...fallback, source: "fallback" };
  }
}
