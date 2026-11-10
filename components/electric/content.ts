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

export const STATS = [
  { value: 8, suffix: "+", display: "8+", label: "Years shipping" },
  { value: 10, suffix: "", display: "10", label: "Teams on one system" },
  { value: 10, suffix: "+", display: "10+", label: "Apps in production" },
  { value: 40, suffix: "m", display: "40m", label: "iOS release time" },
] as const;

export type CaseId = "flowsense" | "design-system" | "rag" | "koil";

export interface Sheet {
  caseId: CaseId;
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

export const SHEETS: Sheet[] = [
  {
    caseId: "flowsense",
    code: "Case 01",
    category: "Medical IoT",
    title: "FlowSense",
    metric: "HIPAA",
    metricLabel: "compliance-conscious data path",
    description:
      "A medical sensor app paired to a wearable through a Swift native module, keeping the BLE session encrypted end to end.",
    tags: ["React Native", "Swift", "CoreBluetooth", "BLE Secure"],
    foot: "Secure BLE link",
    year: "2024",
    accent: "cobalt",
    action: "paper",
    visualLabel: "Open the FlowSense case study",
    visualTag: "Encrypted stream",
    visualTagEnd: "Tap for dossier",
  },
  {
    caseId: "design-system",
    code: "Case 02",
    category: "Design system",
    title: "Enterprise design system",
    metric: "10 teams",
    metricLabel: "shipping from one system",
    description:
      "A multi-tenant React Native component library in an Nx monorepo, documented in Storybook and adopted by ten product teams.",
    tags: ["React Native", "TypeScript", "Nx", "Storybook"],
    foot: "Shared component contract",
    year: "2023",
    accent: "coral",
    action: "ink",
    visualLabel: "Open the enterprise design system case study",
    visualTag: "One contract",
    visualTagEnd: "Ten teams",
  },
  {
    caseId: "rag",
    code: "Case 03",
    category: "Applied AI",
    title: "RAG citation viewer",
    metric: "<2 min",
    metricLabel: "to verify a cited document",
    description:
      "A streaming chat client that points every claim back to its source, drawing polygon overlays on the original document.",
    tags: ["React Native", "Streaming", "RAG", "SVG overlays"],
    foot: "Every claim has a source",
    year: "2025",
    accent: "acid",
    action: "ink",
    visualLabel: "Open the RAG citation viewer case study",
    visualTag: "Source mapped",
    visualTagEnd: "Tap for dossier",
  },
  {
    caseId: "koil",
    code: "Case 04",
    category: "Full-stack",
    title: "Koil",
    metric: "Full-stack",
    metricLabel: "FastAPI service · React client",
    description:
      "A full-stack screener for equities and crypto, pairing an algorithmic scoring service with a fast React interface.",
    tags: ["FastAPI", "React", "Python", "TypeScript"],
    foot: "Short, explainable lists",
    year: "2025",
    accent: "mint",
    action: "ink",
    visualLabel: "Open the Koil case study",
    visualTag: "Signal / noise",
    visualTagEnd: "Tap for dossier",
  },
];

export interface StackGroup {
  number: string;
  title: string;
  accent: "blue" | "coral" | "acid" | "mint";
  skills: string[];
}

export const STACK: StackGroup[] = [
  {
    number: "01",
    title: "Mobile & native",
    accent: "blue",
    skills: [
      "React Native",
      "TypeScript",
      "Swift",
      "Kotlin",
      "TurboModules",
      "CoreBluetooth",
      "Reanimated",
      "React Navigation",
      "Expo",
    ],
  },
  {
    number: "02",
    title: "Frontend & web",
    accent: "coral",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Radix UI",
      "Storybook",
      "Nx",
      "Vite",
      "TanStack Query",
      "Zustand",
    ],
  },
  {
    number: "03",
    title: "Release & CI/CD",
    accent: "acid",
    skills: [
      "GitHub Actions",
      "Fastlane",
      "EAS Build",
      "Xcode Cloud",
      "Codemagic",
      "Docker",
      "Semantic Release",
    ],
  },
  {
    number: "04",
    title: "Signal & security",
    accent: "mint",
    skills: [
      "Sentry",
      "Crashlytics",
      "Datadog",
      "OWASP MASVS",
      "Keychain / Keystore",
      "HIPAA",
      "BLE Secure",
      "TLS / mTLS",
    ],
  },
];

export interface LogEntry {
  company: string;
  role: string;
  description: string;
  tags: string[];
}

export const LOG: LogEntry[] = [
  {
    company: "Telus Digital",
    role: "Senior Frontend & Mobile Engineer",
    description:
      "Senior IC work across React Native and web surfaces, including the shared design system and the CI/CD rebuild that cut iOS releases to forty minutes.",
    tags: ["React Native", "Nx", "Fastlane", "GitHub Actions"],
  },
  {
    company: "Rhaeos",
    role: "Mobile Engineer",
    description:
      "Mobile delivery for FlowSense, bridging a Swift BLE module into React Native and shaping the encrypted health-data path around HIPAA expectations.",
    tags: ["React Native", "Swift", "CoreBluetooth", "HIPAA"],
  },
  {
    company: "Eminent Technology",
    role: "Frontend Engineer",
    description:
      "Enterprise web interfaces and reusable component work — the foundation for the multi-tenant UI patterns that came later.",
    tags: ["React", "TypeScript", "Storybook"],
  },
];

export interface Credential {
  title: string;
  issuer: string;
  href: string;
  linkLabel: string;
}

export const CREDENTIALS: Credential[] = [
  {
    title: "AWS Certified Solutions Architect",
    issuer: "Amazon Web Services · Credly",
    href: "https://www.credly.com",
    linkLabel: "Verify on Credly",
  },
  {
    title: "Azure AI Cloud Developer",
    issuer: "Microsoft Learn",
    href: "https://learn.microsoft.com",
    linkLabel: "Verify on Microsoft Learn",
  },
];

export interface Dossier {
  id: CaseId;
  accent: "cobalt" | "coral" | "acid" | "mint";
  kicker: string;
  title: string;
  meta: Array<{ label: string; value: string }>;
  bullets: string[];
  outcome: string;
}

export const DOSSIERS: Dossier[] = [
  {
    id: "flowsense",
    accent: "cobalt",
    kicker: "Dossier · Medical IoT",
    title: "FlowSense",
    meta: [
      { label: "Role", value: "Mobile engineer" },
      { label: "Platforms", value: "iOS · Android" },
      { label: "Core stack", value: "React Native · Swift · CoreBluetooth" },
    ],
    bullets: [
      "A Swift native module that owns the encrypted BLE session and exposes live sensor streams to React Native.",
      "BLE Secure Connections pairing, so sensor traffic stays encrypted in transit from the first handshake.",
      "A data path shaped around HIPAA expectations for handling and storing health telemetry.",
    ],
    outcome:
      "A medical wearable app where pairing, streaming, and compliance all had to be correct on the first release.",
  },
  {
    id: "design-system",
    accent: "coral",
    kicker: "Dossier · Design system",
    title: "Enterprise design system",
    meta: [
      { label: "Role", value: "Systems engineer" },
      { label: "Reach", value: "10 teams · 10+ apps" },
      { label: "Core stack", value: "React Native · TypeScript · Nx · Storybook" },
    ],
    bullets: [
      "A multi-tenant component library with one shared contract across product brands.",
      "An Nx monorepo with shared tokens, versioning, and build targets that stay consistent as teams ship.",
      "Storybook documentation and adoption support, so ten teams could move without forking components.",
    ],
    outcome:
      "One component contract instead of ten drifting implementations — adopted by ten teams across ten-plus apps.",
  },
  {
    id: "rag",
    accent: "acid",
    kicker: "Dossier · Applied AI",
    title: "RAG citation viewer",
    meta: [
      { label: "Role", value: "Frontend & mobile engineer" },
      { label: "Surface", value: "Streaming chat · document viewer" },
      { label: "Core stack", value: "React Native · streaming APIs · RAG" },
    ],
    bullets: [
      "A React Native chat client that streams answers token by token instead of waiting on a full response.",
      "Polygon overlays that map each citation back to the exact region of the source document.",
      "A verification flow that lets a reviewer confirm a cited document in under two minutes.",
    ],
    outcome: "Answers that are checkable, not just readable — every claim carries a source you can inspect.",
  },
  {
    id: "koil",
    accent: "mint",
    kicker: "Dossier · Full-stack",
    title: "Koil",
    meta: [
      { label: "Role", value: "Full-stack engineer" },
      { label: "Surface", value: "Equity & crypto screener" },
      { label: "Core stack", value: "FastAPI · React · Python · TypeScript" },
    ],
    bullets: [
      "An algorithmic scoring service on FastAPI that screens equities and crypto against configurable criteria.",
      "A React client built for fast scanning, comparison, and drill-down rather than static tables.",
      "A typed seam between the Python service and the TypeScript frontend, kept honest end to end.",
    ],
    outcome: "A screener that turns a broad market into a short, explainable list.",
  },
];

export const CONTACT = {
  email: "babafemiadojutelegan@gmail.com",
  phone: "+1 (773) 641-2696",
  phoneHref: "+17736412696",
  resume: "/assets/Babafemi-Adojutelegan-Resume.pdf",
  github: "https://github.com/babafemiadojutelegan",
  linkedin: "https://www.linkedin.com/in/babafemiadojutelegan/",
} as const;
