import type { Metadata, Viewport } from "next";
import { ElectricPortfolio } from "@/components/electric/ElectricPortfolio";
import "./electric.css";

const title = "Babafemi Adojutelegan — Electric Editorial";
const description =
  "Electric Editorial: the bright, maximalist portfolio of Babafemi Adojutelegan, a senior frontend and mobile engineer in Chicago working in React Native, React, Next.js, and design systems.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#2B3BFF",
  colorScheme: "light",
};

export default function HomePage() {
  return <ElectricPortfolio />;
}
