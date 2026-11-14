import type { Metadata, Viewport } from "next";
import { ExePortfolio } from "@/components/exe/ExePortfolio";
import { EXE_SESSION_KEY, EXE_SKIP_KEY } from "@/components/exe/data";
import "../exe.css";

const title = "BABAFEMI.exe — Interactive Developer Portfolio";
const description =
  "BABAFEMI.exe: a game-inspired portfolio of Babafemi Adojutelegan, a senior software engineer in Chicago working in React Native, React, and TypeScript. Missions, skill tree, career log and a developer terminal.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/exe" },
  openGraph: { title, description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#080D18",
  colorScheme: "dark",
};

// Decides before first paint whether the boot overlay shows, so skippers never see it flash.
const PREPAINT = `try{var s=localStorage.getItem('${EXE_SKIP_KEY}')==='1'||sessionStorage.getItem('${EXE_SESSION_KEY}')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.exeBoot=s?'skip':'run'}catch(e){document.documentElement.dataset.exeBoot='skip'}`;

export default function ExePage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: PREPAINT }} />
      <ExePortfolio />
    </>
  );
}
