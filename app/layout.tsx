import type { Metadata, Viewport } from "next";
import { Chakra_Petch, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { BOOT_PREPAINT_SCRIPT } from "@/lib/boot";
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

export const metadata: Metadata = {
  title: "Babafemi Adojutelegan — Senior Software Engineer",
  description:
    "Senior Software Engineer specializing in React Native, React, TypeScript and cloud systems architecture. Offline-first mobile, BLE healthcare integrations, and enterprise component libraries.",
  openGraph: {
    title: "Babafemi Adojutelegan — Senior Software Engineer",
    description: "Mobile & Full-Stack Systems Architecture. 8+ years shipping React Native, React and cloud systems.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_PREPAINT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
