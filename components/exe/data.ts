// BABAFEMI.exe content. Only facts from the approved brief and the existing Kinetic content —
// no invented dates, awards or metrics. Optional fields render only when filled in.
export { CONTACT } from "../kinetic/content";

export const EXE_SKIP_KEY = "exe-skip-intro";
export const EXE_SESSION_KEY = "exe-booted";

export type SectionId = "home" | "profile" | "skills" | "missions" | "career" | "achievements" | "comms";

export const SECTIONS: Array<{ id: SectionId; index: string; label: string; short: string; blurb: string }> = [
  { id: "home", index: "00", label: "Mission Control", short: "City", blurb: "The city hub" },
  { id: "profile", index: "01", label: "Engineer Profile", short: "Profile", blurb: "About and introduction" },
  { id: "skills", index: "02", label: "Skill Tree", short: "Skills", blurb: "Explore capabilities" },
  { id: "missions", index: "03", label: "Mission Archive", short: "Missions", blurb: "Explore engineering projects" },
  { id: "career", index: "04", label: "Career Log", short: "Career", blurb: "Professional journey" },
  { id: "achievements", index: "05", label: "Achievements", short: "Awards", blurb: "Certifications and impact" },
  { id: "comms", index: "06", label: "Communications", short: "Contact", blurb: "Establish communication" },
];

export const PROFILE = {
  name: "Babafemi Adojutelegan",
  role: "Senior Software Engineer",
  specialization: "Frontend and Mobile Engineering",
  experience: "8+ years",
  location: "Chicago, Illinois",
  core: ["React Native", "React", "TypeScript"],
  intro: "Building scalable web and mobile experiences with React Native, React, and TypeScript.",
  tagline: "Engineering digital experiences.",
};

export const STATS = [
  { value: 8, suffix: "+", label: "Years shipping" },
  { value: 10, suffix: "", label: "Teams on one design system" },
  { value: 10, suffix: "k+", label: "Telemedicine users" },
  { value: 40, suffix: "m", label: "iOS release (from ~5h)" },
];

export type PartSlot = "cpu" | "gpu" | "ram" | "ssd" | "nic" | "npu";

/** Engineering Lab: each attribute is a PC part the visitor installs on the motherboard. */
export const ATTRIBUTES: Array<{ name: string; evidence: string; part: string; partName: string; slot: PartSlot }> = [
  { name: "Architecture", evidence: "Enterprise design systems", part: "CPU", partName: "Processor", slot: "cpu" },
  { name: "Mobile engineering", evidence: "React Native + Swift", part: "GPU", partName: "Graphics card", slot: "gpu" },
  { name: "Technical leadership", evidence: "Cross-team design system adoption", part: "RAM", partName: "Memory", slot: "ram" },
  { name: "Quality engineering", evidence: "Jest, Detox, Maestro", part: "SSD", partName: "Storage", slot: "ssd" },
  { name: "Cloud engineering", evidence: "AWS + Azure", part: "NIC", partName: "Network card", slot: "nic" },
  { name: "AI engineering", evidence: "RAG assistant + document processing", part: "NPU", partName: "AI accelerator", slot: "npu" },
];

/** A Launch Pad mission, built from a Sanity project in app/page.tsx. */
export interface Mission {
  id: string;
  code: string;
  title: string;
  featured: boolean;
  domain?: string;
  tech: string[];
  briefing: string;
  achievement?: string;
  implementation: string[];
  links: Array<{ title: string; url: string }>;
}

export const SKILL_BRANCHES: Array<{ id: string; title: string; skills: string[] }> = [
  {
    id: "mobile",
    title: "Mobile Engineering",
    skills: ["React Native", "Expo / EAS", "Swift Native Modules", "BLE", "Offline-first", "Hermes"],
  },
  { id: "frontend", title: "Frontend Engineering", skills: ["React", "Next.js", "TypeScript", "Storybook", "Nx", "Tailwind CSS"] },
  { id: "data", title: "State & Data", skills: ["Zustand", "TanStack Query", "Streaming", "RAG", "PDF processing", "Firebase"] },
  { id: "cloud", title: "Cloud & Backend", skills: ["AWS", "Azure", "Node.js", "FastAPI", "Python", "Docker"] },
  { id: "quality", title: "Quality Engineering", skills: ["Jest", "Detox", "Maestro", "Playwright", "OWASP MASVS"] },
  { id: "delivery", title: "Delivery & Observability", skills: ["Fastlane", "Azure DevOps", "GitHub Actions", "TestFlight", "Sentry"] },
];


export interface Stage {
  id: string;
  stage: string;
  org: string;
  role: string;
  /** Not in the brief; fill from the resume. */
  period?: string;
  summary?: string;
  tech: string[];
}

export const CAREER: Stage[] = [
  { id: "independent", stage: "01", org: "Independent Consulting", role: "Mobile App Developer", tech: [] },
  {
    id: "eminent",
    stage: "02",
    org: "Eminent Technology",
    role: "Full Stack Developer",
    summary:
      "Enterprise web interfaces and reusable component work — the foundation for the multi-tenant UI patterns that came later.",
    tech: ["React", "TypeScript", "Storybook"],
  },
  {
    id: "rhaeos",
    stage: "03",
    org: "Rhaeos",
    role: "Mobile Application Developer",
    summary:
      "Mobile delivery for FlowSense, bridging a Swift BLE module into React Native and shaping the encrypted health-data path around HIPAA expectations.",
    tech: ["React Native", "Swift", "BLE", "AWS"],
  },
  {
    id: "telus",
    stage: "04",
    org: "TELUS Digital / WillowTree",
    role: "Senior Software Engineer",
    summary:
      "Senior IC work across React Native and web surfaces, including the shared design system and the release pipeline rebuild that cut iOS releases to forty minutes.",
    tech: ["React Native", "Nx", "Storybook", "Playwright", "Fastlane", "Azure DevOps"],
  },
];

export const ACHIEVEMENTS = [
  { id: "architect", title: "Enterprise Architect", evidence: "Design system adopted across 10+ apps" },
  { id: "release", title: "Release Engineer", evidence: "40-minute iOS release cycle" },
  { id: "ai", title: "AI Engineer", evidence: "Clinical RAG assistant" },
  { id: "medtech", title: "Medical Technology Engineer", evidence: "BLE secure native integration" },
  { id: "cloud", title: "Cloud Engineer", evidence: "AWS and Azure production experience" },
];

export const CERTIFICATIONS = [
  { title: "AWS Solutions Architect Associate", issuer: "Amazon Web Services", href: "https://www.credly.com" },
  { title: "Microsoft Azure AI Cloud Developer Associate", issuer: "Microsoft", href: "https://learn.microsoft.com" },
];

/* ---------------------------------------------------------------- game world */

export type DistrictId = Exclude<SectionId, "home">;

const techCount = SKILL_BRANCHES.reduce((n, b) => n + b.skills.length, 0);

/** Buildings along the street, left to right. x/w are world units; the stage is 600 units tall. */
export const DISTRICTS: Array<{ id: DistrictId; name: string; color: string; x: number; w: number; hint: string }> = [
  { id: "profile", name: "Engineer Lab", color: "#43D5FF", x: 900, w: 260, hint: `Meet the engineer: ${PROFILE.experience} with ${PROFILE.core.join(", ")}.` },
  { id: "skills", name: "Skill Tree", color: "#7CFF6B", x: 1340, w: 280, hint: `${SKILL_BRANCHES.length} branches, ${techCount} technologies, each linked to where it was used.` },
  { id: "missions", name: "Launch Pad", color: "#FF9A57", x: 1820, w: 260, hint: "" },
  { id: "career", name: "Career Tower", color: "#C4A8FF", x: 2280, w: 220, hint: `${CAREER.length} floors, ${CAREER.length} stages: from consulting to ${CAREER[CAREER.length - 1].org}.` },
  { id: "achievements", name: "Trophy Hall", color: "#FFD23F", x: 2700, w: 280, hint: "Design system adopted by 10 teams. iOS releases in 40 minutes." },
  { id: "comms", name: "Radio Tower", color: "#FF85E6", x: 3180, w: 220, hint: "Want to build something meaningful? Open a channel here." },
];

export const WORLD_W = 3600;
export const EXE_VISITED_KEY = "exe-visited";

export const IDLE_TIPS = [
  "Use ← → (or A / D) to walk. Press Enter at a door to go inside.",
  "Press Space to jump. Grab the data shards ✦ along the street!",
  "In a hurry? Tap any building, or use the menu up top.",
  "Power user? Try ⌘K / Ctrl+K, or ~ for the terminal.",
];
