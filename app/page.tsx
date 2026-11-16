import type { Metadata, Viewport } from "next";
import { ExePortfolio } from "@/components/exe/ExePortfolio";
import { EXE_SESSION_KEY, EXE_SKIP_KEY, type ArcadeData } from "@/components/exe/data";
import { getPortfolio, slugify } from "@/lib/portfolio";
import "./exe.css";

// Must be a literal for Next to read it statically; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

const title = "Babafemi Adojutelegan — Arcade Edition";
const description =
  "babafemicodes.dev: a game-inspired portfolio of Babafemi Adojutelegan, a senior software engineer in Chicago working in React Native, React, and TypeScript. Missions, skill tree, career log and a developer terminal.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#080D18",
  colorScheme: "dark",
};

// Decides before first paint whether the boot overlay shows, so skippers never see it flash.
const PREPAINT = `try{var s=localStorage.getItem('${EXE_SKIP_KEY}')==='1'||sessionStorage.getItem('${EXE_SESSION_KEY}')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.exeBoot=s?'skip':'run'}catch(e){document.documentElement.dataset.exeBoot='skip'}`;

// "2024-10-21" → "Oct 2024". UTC so the server's timezone can't shift the month.
const month = (d?: string) =>
  d ? new Date(`${d.slice(0, 10)}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "";

export default async function ArcadePage() {
  // Everything Arcade shows that lives in Sanity, in one fetch shared with Command and IDE.
  const { settings, projects, skills, experience, credentials, achievements } = await getPortfolio();

  const data: ArcadeData = {
    // Launch Pad missions: the Sanity projects, in the order Command and IDE show them.
    missions: projects.map((p, i) => ({
      id: p.slug,
      code: String(i + 1).padStart(3, "0"),
      title: p.title,
      featured: p.featured,
      domain: p.domain,
      tech: p.techStack,
      briefing: p.summary ?? "",
      achievement: p.metrics[0],
      implementation: p.body
        .map((b) => (Array.isArray(b.children) ? b.children.map((c) => ("text" in c ? String(c.text) : "")).join("") : ""))
        .filter((t) => t.trim()),
      links: [...(p.githubUrl ? [{ title: "Source code", url: p.githubUrl }] : []), ...p.links],
    })),
    skills: skills.map((g) => ({ id: g.id, title: g.title, skills: g.skills })),
    // Career Tower climbs from the first job to the latest, so oldest first.
    career: [...experience].reverse().map((e, i) => ({
      id: slugify(e.company) || e.id,
      stage: String(i + 1).padStart(2, "0"),
      org: e.company,
      role: e.role,
      location: e.location,
      period: [month(e.startDate), e.current ? "Present" : month(e.endDate)].filter(Boolean).join(" – "),
      highlights: e.highlights,
      tech: e.techStack,
    })),
    achievements,
    certifications: credentials
      .filter((c) => c.kind === "certification")
      .map((c) => ({ id: c.id, title: c.title, issuer: c.issuer, code: c.code, url: c.verifyUrl })),
    contact: {
      email: settings.email,
      linkedin: settings.linkedinUrl,
      github: settings.githubUrl,
      // ?dl= makes Sanity's CDN send it as a download, since `download` is ignored cross-origin.
      resume: settings.resumeUrl ? `${settings.resumeUrl}?dl=Babafemi-Adojutelegan-Resume.pdf` : undefined,
    },
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
      <ExePortfolio data={data} />
    </>
  );
}
