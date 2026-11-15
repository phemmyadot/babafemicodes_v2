import type { Metadata, Viewport } from "next";
import { KineticPortfolio } from "@/components/kinetic/KineticPortfolio";
import { buildKineticContent } from "@/components/kinetic/content";
import { getPortfolio } from "@/lib/portfolio";
import "../kinetic.css";

const title = "Babafemi Adojutelegan — Kinetic Edition";
const description =
  "Kinetic edition portfolio of Babafemi Adojutelegan, a senior frontend and mobile engineer in Chicago working in React Native, React, Next.js, and design systems.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/kinetic" },
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#04060A",
  colorScheme: "dark",
};

// Must be a literal for Next to read it statically; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

export default async function KineticPage() {
  return <KineticPortfolio content={buildKineticContent(await getPortfolio())} />;
}
