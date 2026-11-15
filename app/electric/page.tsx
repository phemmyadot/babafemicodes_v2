import type { Metadata, Viewport } from "next";
import { ElectricPortfolio } from "@/components/electric/ElectricPortfolio";
import { buildElectricContent } from "@/components/electric/content";
import { getPortfolio } from "@/lib/portfolio";
import "../electric.css";

const title = "Babafemi Adojutelegan — Electric Editorial";
const description =
  "Electric Editorial: the bright, maximalist portfolio of Babafemi Adojutelegan, a senior frontend and mobile engineer in Chicago working in React Native, React, Next.js, and design systems.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/electric" },
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#2B3BFF",
  colorScheme: "light",
};

// Must be a literal for Next to read it statically; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

export default async function ElectricPage() {
  return <ElectricPortfolio content={buildElectricContent(await getPortfolio())} />;
}
