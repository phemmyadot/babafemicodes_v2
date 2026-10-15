import type { PortableTextBlock } from "@portabletext/types";

export type Signal = "rising" | "steady" | "spiky" | "wave";

export interface Settings {
  name: string;
  /** Hero title; "|" splits main/sub. */
  title: string;
  titles: string[];
  tagline?: string;
  /** Paragraphs; the hero shows the first. */
  bio: string[];
  avatarUrl?: string;
  location?: string;
  workStatus?: string;
  openToWork?: boolean;
  email: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  blogUrl?: string;
  resumeUrl?: string;
}

export interface Metric {
  id: string;
  value: string;
  unit?: string;
  label: string;
  detail?: string;
  signal: Signal;
}

export interface SkillGroup {
  id: string;
  title: string;
  skills: string[];
}

export interface ProjectLink {
  title: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  client?: string;
  role?: string;
  summary: string;
  body: PortableTextBlock[];
  metrics: string[];
  techStack: string[];
  /** Display label for the category, e.g. "Full Stack". */
  domain?: string;
  featured: boolean;
  links: ProjectLink[];
  githubUrl?: string;
  thumbnailUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current: boolean;
  highlights: string[];
  techStack: string[];
}

export interface Credential {
  id: string;
  title: string;
  kind: "certification" | "education";
  issuer?: string;
  code?: string;
  year?: string;
  verifyUrl?: string;
}

export interface Portfolio {
  settings: Settings;
  metrics: Metric[];
  skills: SkillGroup[];
  projects: Project[];
  experience: Experience[];
  credentials: Credential[];
}
