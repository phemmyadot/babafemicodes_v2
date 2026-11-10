import type { Metadata, Viewport } from "next";
import { KineticPortfolio } from "@/components/kinetic/KineticPortfolio";
import "./kinetic.css";

const title = "Babafemi Adojutelegan — Kinetic Edition";
const description =
  "Kinetic edition portfolio of Babafemi Adojutelegan, a senior frontend and mobile engineer in Chicago working in React Native, React, Next.js, and design systems.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#04060A",
  colorScheme: "dark",
};

export default function HomePage() {
  return <KineticPortfolio />;
}
