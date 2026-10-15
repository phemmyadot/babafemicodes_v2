import type { Metadata } from "next";
import { PortfolioShell } from "@/components/PortfolioShell";
import { getPortfolio } from "@/lib/portfolio";

// Must be a literal for Next to read it statically; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPortfolio();
  const title = [settings.name, settings.title.split("|")[0]?.trim()].filter(Boolean).join(" — ");
  const description = settings.bio[0];
  return {
    title,
    description,
    openGraph: { title, description, type: "website", images: settings.avatarUrl ? [settings.avatarUrl] : undefined },
  };
}

export default async function HomePage() {
  const portfolio = await getPortfolio();
  return <PortfolioShell data={portfolio} />;
}
