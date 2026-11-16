// Arcade edition content. Only facts from the approved brief and the existing Kinetic content —
// no invented dates, awards or metrics. Optional fields render only when filled in.

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

export interface Stage {
  id: string;
  stage: string;
  org: string;
  role: string;
  location?: string;
  period: string;
  highlights: string[];
  tech: string[];
}

/** Everything Arcade shows that lives in Sanity. Built in app/page.tsx, shared via context. */
export interface ArcadeData {
  missions: Mission[];
  skills: Array<{ id: string; title: string; skills: string[] }>;
  career: Stage[];
  achievements: Array<{ id: string; title: string; evidence?: string }>;
  certifications: Array<{ id: string; title: string; issuer?: string; code?: string; url?: string }>;
  contact: { email: string; linkedin?: string; github?: string; resume?: string };
}

/* ---------------------------------------------------------------- game world */

export type DistrictId = Exclude<SectionId, "home">;

/** Buildings along the street, left to right. x/w are world units; the stage is 600 units tall.
 *  An empty hint is filled in from Sanity data by GameWorld. */
export const DISTRICTS: Array<{ id: DistrictId; name: string; color: string; x: number; w: number; hint: string }> = [
  { id: "profile", name: "Engineer Lab", color: "#43D5FF", x: 900, w: 260, hint: `Meet the engineer: ${PROFILE.experience} with ${PROFILE.core.join(", ")}.` },
  { id: "skills", name: "Skill Tree", color: "#7CFF6B", x: 1340, w: 280, hint: "" },
  { id: "missions", name: "Launch Pad", color: "#FF9A57", x: 1820, w: 260, hint: "" },
  { id: "career", name: "Career Tower", color: "#C4A8FF", x: 2280, w: 220, hint: "" },
  { id: "achievements", name: "Trophy Hall", color: "#FFD23F", x: 2700, w: 280, hint: "Design system adopted by 10 teams. iOS releases in 40 minutes." },
  { id: "comms", name: "Radio Tower", color: "#FF85E6", x: 3180, w: 220, hint: "Want to build something meaningful? Open a channel here." },
];

export const WORLD_W = 3600;
export const EXE_VISITED_KEY = "exe-visited";

export const IDLE_TIPS = [
  "Use ← → (or A / D) to walk. Press Enter at a door to go inside.",
  "Grab the data shards ✦ along the street as you walk!",
  "In a hurry? Tap any building, or use the menu up top.",
  "Power user? Try ⌘K / Ctrl+K, or ~ for the terminal.",
];
