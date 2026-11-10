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

export const STATS = [
  { value: 8, suffix: "+", display: "8+", label: "Years shipping" },
  { value: 10, suffix: "", display: "10", label: "Teams on one system" },
  { value: 10, suffix: "+", display: "10+", label: "Apps in production" },
  { value: 40, suffix: "m", display: "40m", label: "iOS release time" },
];

export type ModuleViz = "flowsense" | "design-system" | "rag" | "koil";

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
  hitLabel: string;
}

export const MODULES: ModuleContent[] = [
  {
    caseId: "flowsense",
    code: "MOD-01",
    category: "Medical IoT",
    title: "FlowSense",
    metric: "HIPAA",
    metricLabel: "compliance-conscious data path",
    description:
      "A medical sensor app paired to a wearable through a Swift native module, keeping the BLE session encrypted end to end.",
    tags: ["React Native", "Swift", "CoreBluetooth", "BLE Secure"],
    year: "2024",
    viz: "flowsense",
    hitLabel: "Open case study: FlowSense, medical sensor BLE app",
  },
  {
    caseId: "design-system",
    code: "MOD-02",
    category: "Design system",
    title: "Enterprise design system",
    metric: "10 teams",
    metricLabel: "shipping from one system",
    description:
      "A multi-tenant React Native component library in an Nx monorepo, documented in Storybook and adopted by ten product teams.",
    tags: ["React Native", "TypeScript", "Nx", "Storybook"],
    year: "2023",
    viz: "design-system",
    hitLabel: "Open case study: Enterprise React Native design system",
  },
  {
    caseId: "rag",
    code: "MOD-03",
    category: "Applied AI",
    title: "RAG citation viewer",
    metric: "<2 min",
    metricLabel: "to verify a cited document",
    description:
      "A streaming chat client that points every claim back to its source, drawing polygon overlays on the original document.",
    tags: ["React Native", "Streaming", "RAG", "SVG overlays"],
    year: "2025",
    viz: "rag",
    hitLabel: "Open case study: RAG document citation viewer",
  },
  {
    caseId: "koil",
    code: "MOD-04",
    category: "Full-stack",
    title: "Koil",
    metric: "Full-stack",
    metricLabel: "FastAPI service · React client",
    description:
      "A full-stack screener for equities and crypto, pairing an algorithmic scoring service with a fast React interface.",
    tags: ["FastAPI", "React", "Python", "TypeScript"],
    year: "2025",
    viz: "koil",
    hitLabel: "Open case study: Koil algorithmic equity and crypto screener",
  },
];

export const STACK = [
  {
    index: "01 // Native",
    title: "Mobile & Native Modules",
    skills: [
      "React Native",
      "TypeScript",
      "Swift",
      "Kotlin",
      "TurboModules",
      "Native Modules",
      "CoreBluetooth",
      "Reanimated",
      "React Navigation",
      "Expo",
    ],
  },
  {
    index: "02 // Web",
    title: "Frontend & Web",
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
    index: "03 // Release",
    title: "DevOps & Release CI/CD",
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
    index: "04 // Signal",
    title: "Observability & Security",
    skills: [
      "Sentry",
      "Crashlytics",
      "Datadog",
      "OWASP MASVS",
      "Keychain / Keystore",
      "HIPAA",
      "BLE Secure Connections",
      "TLS / mTLS",
    ],
  },
];

export const EXPERIENCE = [
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

export const CREDENTIALS = [
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
  id: string;
  kicker: string;
  title: string;
  meta: Array<{ label: string; value: string }>;
  bullets: string[];
  outcome: string;
}

export const DOSSIERS: Dossier[] = [
  {
    id: "flowsense",
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
    outcome:
      "Answers that are checkable, not just readable — every claim carries a source you can inspect.",
  },
  {
    id: "koil",
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
  github: "https://github.com/babafemiadojutelegan",
  linkedin: "https://www.linkedin.com/in/babafemiadojutelegan/",
  resume: "/assets/Babafemi-Adojutelegan-Resume.pdf",
};
