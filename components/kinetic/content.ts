import { editionContent, type Art } from "@/lib/edition-content";
import type { Portfolio } from "@/lib/types";

export const NAV = [
  { id: "mission", index: "01", label: "Mission" },
  { id: "modules", index: "02", label: "Modules" },
  { id: "stack", index: "03", label: "Stack" },
  { id: "timeline", index: "04", label: "Timeline" },
  { id: "uplink", index: "05", label: "Uplink" },
] as const;

export const MARQUEE_A = [
  { label: "React Native" },
  { label: "TypeScript" },
  { label: "Swift" },
  { label: "Next.js" },
  { label: "Design Systems", hot: true },
  { label: "Nx" },
  { label: "Storybook" },
  { label: "FastAPI" },
];

export const MARQUEE_B = [
  { label: "BLE Secure", hot: true },
  { label: "HIPAA" },
  { label: "CI/CD" },
  { label: "Fastlane" },
  { label: "Observability" },
  { label: "TurboModules" },
  { label: "Reanimated" },
  { label: "OWASP MASVS" },
];


/** Which decorative visual a module card uses (see ModuleVisual). */
export type ModuleViz = Art;

export interface ModuleContent {
  caseId: string;
  code: string;
  category: string;
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
  tags: string[];
  year: string;
  viz: ModuleViz;
  /** Captions printed over the visual. */
  captionStart: string;
  captionEnd: string;
  hitLabel: string;
}





export interface Dossier {
  id: string;
  kicker: string;
  title: string;
  meta: Array<{ label: string; value: string }>;
  bullets: string[];
  outcome: string;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Kinetic's content, built from Sanity (see app/kinetic/page.tsx). */
export function buildKineticContent(portfolio: Portfolio) {
  const c = editionContent(portfolio);
  const MODULES: ModuleContent[] = c.projects.map((p) => ({
    caseId: p.id,
    code: `MOD-${pad(p.n)}`,
    category: p.category,
    title: p.title,
    metric: p.metric,
    metricLabel: p.metricLabel,
    description: p.short,
    tags: p.tags.slice(0, 4),
    year: p.repo ? "GitHub" : "",
    viz: p.art,
    captionStart: p.category,
    captionEnd: p.tags[0] ?? "",
    hitLabel: `Open case study: ${p.title}`,
  }));
  const DOSSIERS: Dossier[] = c.projects.map((p) => ({
    id: p.id,
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
    MODULES,
    STACK: c.skills.map((g, i) => ({ index: `${pad(i + 1)} // ${g.title.split(/\s|&/)[0]}`, title: g.title, skills: g.skills })),
    EXPERIENCE: c.experience,
    CREDENTIALS: c.credentials,
    DOSSIERS,
    CONTACT: c.contact,
  };
}

export type KineticContent = ReturnType<typeof buildKineticContent>;
