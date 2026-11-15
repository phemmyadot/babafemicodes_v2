import type { Metadata, Viewport } from "next";
import { ExePortfolio } from "@/components/exe/ExePortfolio";
import { EXE_SESSION_KEY, EXE_SKIP_KEY, type Mission } from "@/components/exe/data";
import { getPortfolio } from "@/lib/portfolio";
import "./exe.css";

// Must be a literal for Next to read it statically; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

const title = "Babafemi Adojutelegan — Arcade Edition";
const description =
  "BABAFEMI.exe: a game-inspired portfolio of Babafemi Adojutelegan, a senior software engineer in Chicago working in React Native, React, and TypeScript. Missions, skill tree, career log and a developer terminal.";

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

export default async function ArcadePage() {
  // Launch Pad missions are the Sanity projects, in the same order Command and IDE show them.
  const { projects } = await getPortfolio();
  const missions: Mission[] = projects.map((p, i) => ({
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
  }));

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
      <ExePortfolio missions={missions} />
    </>
  );
}
