import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/kinetic`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/exe`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/command`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/ide`, changeFrequency: "monthly", priority: 0.6 },
  ];
}
