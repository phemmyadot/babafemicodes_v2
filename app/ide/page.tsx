import type { Metadata, Viewport } from "next";
import { IdePortfolio } from "@/components/ide/IdePortfolio";
import type { ExperienceItem, Profile, Project, SkillGroup } from "@/components/ide/types";
import { getBlogPosts } from "@/lib/hashnode";
import { getPortfolio } from "@/lib/portfolio";
import "../ide.css";

// Must be a literal for Next to read it statically; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

const title = "Babafemi Adojutelegan — IDE Edition";
const description =
  "IDE Edition: the portfolio of Babafemi Adojutelegan as a code editor. README, experience, skills, projects, blog and contact as files.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ide" },
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#1e1e1e",
  colorScheme: "dark",
};

export default async function IdePage() {
  const { settings: s, metrics, skills, projects, experience, credentials } = await getPortfolio();

  // Map this site's Sanity content onto the shapes the IDE edition was built against.
  const [firstName = "", ...rest] = s.name.split(" ");
  const profile: Profile = {
    firstName,
    lastName: rest.join(" "),
    tagline: s.tagline ?? "",
    titles: s.titles.length ? s.titles : [s.title.split("|")[0].trim()],
    bio: s.bio,
    email: s.email,
    linkedin: s.linkedinUrl ?? "",
    github: s.githubUrl ?? "",
    hashnode: s.blogUrl ?? "",
    avatar: s.avatarUrl ?? null,
    resumeUrl: s.resumeUrl ?? "",
    openToWork: !!s.openToWork,
    stats: metrics.map((m) => ({ value: m.value + (m.unit ?? ""), label: m.label })),
    certifications: credentials
      .filter((c) => c.kind === "certification")
      .map((c) => ({
        label: [c.title + (c.code ? ` (${c.code})` : ""), c.issuer].filter(Boolean).join(" | "),
        url: c.verifyUrl ?? null,
      })),
  };

  const ideExperience: ExperienceItem[] = experience.map((e) => ({
    company: e.company,
    role: e.role,
    startDate: e.startDate ?? "",
    endDate: e.endDate ?? null,
    current: e.current,
    bullets: e.highlights,
  }));

  const skillGroups: SkillGroup[] = skills.map((g) => ({ label: g.title, skills: g.skills }));

  const ideProjects: Project[] = projects.map((p, i) => ({
    id: p.id,
    title: p.title,
    description: p.summary,
    tags: p.techStack,
    categoryLabel: p.domain ?? "",
    repository: p.githubUrl,
    liveUrls: p.links.map((l) => ({ title: l.title, link: l.url })),
    featured: p.featured,
    order: i,
    thumbnail: p.thumbnailUrl,
    extras: [p.client, p.role].filter((x): x is string => !!x),
  }));

  const blogPosts = s.blogUrl ? await getBlogPosts(s.blogUrl) : [];

  return (
    <IdePortfolio
      profile={profile}
      experience={ideExperience}
      skillGroups={skillGroups}
      projects={ideProjects}
      blogPosts={blogPosts}
    />
  );
}
