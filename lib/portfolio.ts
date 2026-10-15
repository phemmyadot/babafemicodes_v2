import "server-only";
import { sanityClient } from "./sanity/client";
import { PORTFOLIO_QUERY, PORTFOLIO_TAG } from "./sanity/queries";
import type { Credential, Experience, Metric, Portfolio, Project, Settings, Signal, SkillGroup } from "./types";

/** ISR window; on-demand revalidation via webhook makes publishes show up immediately. */
export const REVALIDATE_SECONDS = 3600;

const SIGNALS: Signal[] = ["rising", "steady", "spiky", "wave"];

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

const opt = (v: string | null | undefined) => (v && v.trim() ? v.trim() : undefined);

function mapSettings(p: SanityProfile | null): Settings {
  const titles = clean(p?.titles);
  return {
    name: [p?.firstName, p?.lastName].filter(Boolean).join(" "),
    title: opt(p?.headline) ?? titles[0] ?? "",
    titles,
    tagline: opt(p?.tagline),
    bio: clean(p?.bio),
    avatarUrl: opt(p?.avatarUrl),
    location: opt(p?.location),
    workStatus: opt(p?.workStatus),
    openToWork: p?.openToWork,
    email: opt(p?.email) ?? "",
    phone: opt(p?.phone),
    githubUrl: opt(p?.github),
    linkedinUrl: opt(p?.linkedin),
    blogUrl: opt(p?.hashnode),
    resumeUrl: opt(p?.resumeUrl),
  };
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
 * Fetches all portfolio content from Sanity — the single source of truth. Nothing is
 * filled in from local data: an empty field stays empty and an empty section is hidden.
 *
 * Errors are thrown on purpose. During ISR regeneration Next keeps serving the last
 * successfully rendered page, so a Sanity outage never swaps in different content.
 */
export async function getPortfolio(): Promise<Portfolio> {
  if (!sanityClient) {
    throw new Error("Sanity is not configured: set NEXT_PUBLIC_SANITY_PROJECT_ID (and SANITY_API_TOKEN) in .env.local");
  }

  const data = await sanityClient.fetch<SanityResult>(
    PORTFOLIO_QUERY,
    {},
    { next: { revalidate: REVALIDATE_SECONDS, tags: [PORTFOLIO_TAG] } },
  );

  return {
    settings: mapSettings(data.profile),
    metrics: mapMetrics(data.profile),
    skills: data.skills.map((g) => ({ ...g, skills: clean(g.skills) })).filter((g) => g.skills.length),
    projects: mapProjects(data.projects),
    experience: data.experience.map((e) => ({ ...e, highlights: clean(e.highlights), techStack: clean(e.techStack) })),
    credentials: mapCredentials(data.profile),
  };
}
