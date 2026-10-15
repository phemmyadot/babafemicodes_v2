import { PortfolioShell } from "@/components/PortfolioShell";
import { getPortfolio } from "@/lib/portfolio";

// Must be a literal for Next to read it statically; keep in sync with REVALIDATE_SECONDS.
export const revalidate = 3600;

export default async function HomePage() {
  const portfolio = await getPortfolio();
  return <PortfolioShell data={portfolio} />;
}
