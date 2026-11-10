import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Chakra_Petch,
  IBM_Plex_Sans,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { BOOT_PREPAINT_SCRIPT } from "@/lib/boot";
import { SITE_DOMAIN, SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});
const kineticBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});
const electricDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});
const electricSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});

// Page-specific title/description for the Classic edition come from Sanity via generateMetadata in app/classic/page.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_DOMAIN,
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#04060A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} ${kineticBody.variable} ${electricDisplay.variable} ${electricSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_PREPAINT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
