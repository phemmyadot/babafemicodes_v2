import { editionContent, type Art } from "@/lib/edition-content";
import type { Portfolio } from "@/lib/types";

export const NAV = [
  { id: "work", label: "Work", index: "01" },
  { id: "stack", label: "Stack", index: "02" },
  { id: "log", label: "Log", index: "03" },
  { id: "contact", label: "Contact", index: "04" },
] as const;

export const RIBBON_A = [
  "React Native",
  "Design systems",
  "Next.js",
  "Swift",
  "Nx",
  "Storybook",
] as const;

export const RIBBON_B = [
  "BLE secure",
  "HIPAA",
  "CI/CD",
  "Fastlane",
  "Observability",
  "OWASP MASVS",
] as const;


/** Which decorative illustration a project card uses (see SheetVisual). */
export type CaseId = Art;

export interface Sheet {
  /** Project slug; links the card to its dossier dialog (#case-<id>). */
  caseId: string;
  art: CaseId;
  code: string;
  category: string;
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
  tags: string[];
  foot: string;
  year: string;
  accent: "cobalt" | "coral" | "acid" | "mint";
  action: "paper" | "ink";
  visualLabel: string;
  visualTag: string;
  visualTagEnd: string;
}


export interface StackGroup {
  number: string;
  title: string;
  accent: "blue" | "coral" | "acid" | "mint";
  skills: string[];
}


export interface LogEntry {
  company: string;
  role: string;
  description: string;
  tags: string[];
}


export interface Credential {
  title: string;
  issuer: string;
  href: string;
  linkLabel: string;
}


export interface Dossier {
  id: string;
  accent: "cobalt" | "coral" | "acid" | "mint";
  kicker: string;
  title: string;
  meta: Array<{ label: string; value: string }>;
  bullets: string[];
  outcome: string;
}

const SHEET_ACCENTS = ["cobalt", "coral", "acid", "mint"] as const;
const STACK_ACCENTS = ["blue", "coral", "acid", "mint"] as const;
const pad = (n: number) => String(n).padStart(2, "0");

/** Electric's content, built from Sanity (see app/electric/page.tsx). */
export function buildElectricContent(portfolio: Portfolio) {
  const c = editionContent(portfolio);
  const SHEETS: Sheet[] = c.projects.map((p, i) => ({
    caseId: p.id,
    art: p.art,
    code: `Case ${pad(p.n)}`,
    category: p.category,
    title: p.title,
    metric: p.metric,
    metricLabel: p.metricLabel,
    description: p.short,
    tags: p.tags.slice(0, 4),
    foot: p.tags.slice(0, 2).join(" · "),
    year: p.repo ? "Source on GitHub" : "",
    accent: SHEET_ACCENTS[i % SHEET_ACCENTS.length],
    action: i === 0 ? "paper" : "ink",
    visualLabel: `Open the ${p.title} case study`,
    visualTag: p.category,
    visualTagEnd: "Tap for dossier",
  }));
  const DOSSIERS: Dossier[] = c.projects.map((p, i) => ({
    id: p.id,
    accent: SHEET_ACCENTS[i % SHEET_ACCENTS.length],
    kicker: `Dossier · ${p.category}`,
    title: p.title,
    meta: [
      ...(p.role ? [{ label: "Role", value: p.role }] : []),
      { label: "Category", value: p.category },
      { label: "Core stack", value: p.tags.slice(0, 4).join(" · ") },
    ],
    bullets: p.bullets,
    outcome: p.outcome,
  }));
  return {
    LOCATION: c.location,
    LEDE: c.lede,
    STATS: c.stats,
    SHEETS,
    STACK: c.skills.map((g, i): StackGroup => ({ number: pad(i + 1), title: g.title, accent: STACK_ACCENTS[i % STACK_ACCENTS.length], skills: g.skills })),
    LOG: c.experience as LogEntry[],
    CREDENTIALS: c.credentials as Credential[],
    DOSSIERS,
    CONTACT: c.contact,
  };
}

export type ElectricContent = ReturnType<typeof buildElectricContent>;
