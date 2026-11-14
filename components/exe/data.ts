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

export const ATTRIBUTES = [
  { name: "Architecture", evidence: "Enterprise design systems", missions: ["design-system"] },
  { name: "Mobile engineering", evidence: "React Native + Swift", missions: ["flowsense", "telemedicine"] },
  { name: "Cloud engineering", evidence: "AWS + Azure", missions: ["flowsense", "release-automation"] },
  { name: "AI engineering", evidence: "RAG assistant + document processing", missions: ["clinical-ai"] },
  { name: "Quality engineering", evidence: "Jest, Detox, Maestro", missions: [] },
  { name: "Technical leadership", evidence: "Cross-team design system adoption", missions: ["design-system"] },
];

export interface Mission {
  id: string;
  code: string;
  title: string;
  featured?: boolean;
  tech: string[];
  briefing: string;
  achievement: string;
  /** Pipeline stages for the architecture diagram, left to right. */
  architecture: string[];
  implementation?: string[];
  problem?: string;
  challenges?: string[];
  lessons?: string[];
  related: string[];
  demo?: "citations";
}

export const MISSIONS: Mission[] = [
  {
    id: "clinical-ai",
    code: "001",
    title: "Clinical AI Assistant",
    featured: true,
    tech: ["React Native", "TypeScript", "RAG", "PDF processing", "Streaming"],
    briefing:
      "An AI-powered clinical research assistant with streaming answers, citations, and document passage highlighting.",
    achievement: "Verification reduced from hours to under 2 minutes per 1,000+ pages.",
    architecture: ["Source PDFs", "Retrieval (RAG)", "Streaming answer", "Citations", "Passage highlight"],
    implementation: [
      "A React Native chat client that streams answers token by token instead of waiting on a full response.",
      "Polygon overlays that map each citation back to the exact region of the source document.",
      "A verification flow that lets a reviewer confirm a cited document in under two minutes.",
    ],
    related: ["design-system"],
    demo: "citations",
  },
  {
    id: "design-system",
    code: "002",
    title: "Enterprise Design System",
    tech: ["React Native", "TypeScript", "Nx", "Storybook", "Playwright"],
    briefing: "A reusable, multi-tenant React Native design system for a major US insurer.",
    achievement: "Adopted by 10 teams across 10+ applications.",
    architecture: ["Design tokens", "Nx monorepo", "Storybook docs", "Playwright checks", "10 product teams"],
    implementation: [
      "A multi-tenant component library with one shared contract across product brands.",
      "An Nx monorepo with shared tokens, versioning, and build targets that stay consistent as teams ship.",
      "Storybook documentation and adoption support, so ten teams could move without forking components.",
    ],
    related: ["release-automation", "clinical-ai"],
  },
  {
    id: "flowsense",
    code: "003",
    title: "FlowSense",
    tech: ["React Native", "Swift", "BLE", "AWS"],
    briefing: "Medical device companion applications for patient and clinician workflows.",
    achievement: "BLE Secure Connections, native module integration, and AWS processing.",
    architecture: ["Wearable sensor", "BLE Secure pairing", "Swift native module", "React Native app", "AWS processing"],
    implementation: [
      "A Swift native module that owns the encrypted BLE session and exposes live sensor streams to React Native.",
      "BLE Secure Connections pairing, so sensor traffic stays encrypted in transit from the first handshake.",
      "A data path shaped around HIPAA expectations for handling and storing health telemetry.",
    ],
    related: ["telemedicine"],
  },
  {
    id: "telemedicine",
    code: "004",
    title: "Telemedicine Platform",
    tech: ["React Native", "Node.js", "Firebase"],
    briefing: "A high-availability telemedicine platform.",
    achievement: "Serving 10,000+ users.",
    architecture: ["React Native app", "Node.js services", "Firebase"],
    related: ["flowsense"],
  },
  {
    id: "release-automation",
    code: "005",
    title: "Mobile Release Automation",
    tech: ["Fastlane", "Azure DevOps", "Xcode", "TestFlight"],
    briefing: "Automated mobile build and distribution infrastructure.",
    achievement: "iOS release time reduced from approximately 5 hours to 40 minutes.",
    architecture: ["Commit", "Azure DevOps pipeline", "Xcode build", "Fastlane", "TestFlight"],
    related: ["design-system"],
  },
];

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
  missions: string[];
}

export const CAREER: Stage[] = [
  { id: "independent", stage: "01", org: "Independent Consulting", role: "Mobile App Developer", tech: [], missions: [] },
  {
    id: "eminent",
    stage: "02",
    org: "Eminent Technology",
    role: "Full Stack Developer",
    summary:
      "Enterprise web interfaces and reusable component work — the foundation for the multi-tenant UI patterns that came later.",
    tech: ["React", "TypeScript", "Storybook"],
    missions: [],
  },
  {
    id: "rhaeos",
    stage: "03",
    org: "Rhaeos",
    role: "Mobile Application Developer",
    summary:
      "Mobile delivery for FlowSense, bridging a Swift BLE module into React Native and shaping the encrypted health-data path around HIPAA expectations.",
    tech: ["React Native", "Swift", "BLE", "AWS"],
    missions: ["flowsense"],
  },
  {
    id: "telus",
    stage: "04",
    org: "TELUS Digital / WillowTree",
    role: "Senior Software Engineer",
    summary:
      "Senior IC work across React Native and web surfaces, including the shared design system and the release pipeline rebuild that cut iOS releases to forty minutes.",
    tech: ["React Native", "Nx", "Storybook", "Playwright", "Fastlane", "Azure DevOps"],
    missions: ["design-system", "release-automation"],
  },
];

export const ACHIEVEMENTS = [
  { id: "architect", title: "Enterprise Architect", evidence: "Design system adopted across 10+ apps", mission: "design-system" },
  { id: "release", title: "Release Engineer", evidence: "40-minute iOS release cycle", mission: "release-automation" },
  { id: "ai", title: "AI Engineer", evidence: "Clinical RAG assistant", mission: "clinical-ai" },
  { id: "medtech", title: "Medical Technology Engineer", evidence: "BLE secure native integration", mission: "flowsense" },
  { id: "cloud", title: "Cloud Engineer", evidence: "AWS and Azure production experience", mission: "flowsense" },
];

export const CERTIFICATIONS = [
  { title: "AWS Solutions Architect Associate", issuer: "Amazon Web Services", href: "https://www.credly.com" },
  { title: "Microsoft Azure AI Cloud Developer Associate", issuer: "Microsoft", href: "https://learn.microsoft.com" },
];

// Sanitized, fictional sample for the citation demo. Not client data.
export const DEMO = {
  question: "What dose was used in the extension phase, and what was the most common adverse event?",
  doc: [
    { id: "p1", text: "Study ZX-204 enrolled 312 adult participants across 14 sites in a randomized, double-blind design." },
    { id: "p2", text: "During the 24-week extension phase, participants received 40 mg once daily with food." },
    { id: "p3", text: "Adherence was tracked through a mobile diary and weekly pill counts." },
    { id: "p4", text: "The most frequently reported adverse event was mild headache (11.2%), typically resolving within 48 hours." },
    { id: "p5", text: "No treatment-related serious adverse events were observed during the extension phase." },
  ],
  answer: [
    { text: "The extension phase used 40 mg once daily with food", cite: "p2" },
    { text: ". The most common adverse event was mild headache at 11.2%, usually resolving within two days", cite: "p4" },
    { text: ", and no treatment-related serious events were reported", cite: "p5" },
    { text: "." },
  ] as Array<{ text: string; cite?: string }>,
};

/* ---------------------------------------------------------------- game world */

export type DistrictId = Exclude<SectionId, "home">;

const techCount = SKILL_BRANCHES.reduce((n, b) => n + b.skills.length, 0);

/** Buildings along the street, left to right. x/w are world units; the stage is 600 units tall. */
export const DISTRICTS: Array<{ id: DistrictId; name: string; color: string; x: number; w: number; hint: string }> = [
  { id: "profile", name: "Engineer Lab", color: "#43D5FF", x: 900, w: 260, hint: `Meet the engineer: ${PROFILE.experience} with ${PROFILE.core.join(", ")}.` },
  { id: "skills", name: "Skill Tree", color: "#7CFF6B", x: 1340, w: 280, hint: `${SKILL_BRANCHES.length} branches, ${techCount} technologies, each linked to where it was used.` },
  { id: "missions", name: "Launch Pad", color: "#FF9A57", x: 1820, w: 260, hint: `${MISSIONS.length} missions inside. Mission 001 cut verification from hours to under 2 minutes.` },
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
