// Data shapes the IDE edition renders. app/ide/page.tsx maps this site's Sanity content onto them.
export type { BlogPost } from "@/lib/hashnode";

export interface Profile {
  firstName: string;
  lastName: string;
  tagline: string;
  titles: string[];
  bio: string[];
  email: string;
  linkedin: string;
  github: string;
  hashnode: string;
  avatar: string | null;
  resumeUrl: string;
  openToWork: boolean;
  stats: { value: string; label: string }[];
  certifications: { label: string; url: string | null }[];
}

export interface ExperienceItem {
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  bullets: string[];
}

export interface SkillGroup {
  label: string;
  skills: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  categoryLabel: string;
  repository?: string;
  liveUrls?: { title: string; link: string }[];
  featured: boolean;
  order: number;
  thumbnail?: string;
  extras: string[];
}
