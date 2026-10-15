import { createClient, type SanityClient } from "@sanity/client";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

export { isSanityConfigured };

// Same variable name as the original babafemi.codes project, so one .env works for both.
const token = process.env.SANITY_API_TOKEN || undefined;

/** `null` when no project is configured — callers fall back to bundled content. */
export const sanityClient: SanityClient | null = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      // CDN is faster but can't serve token-authenticated reads.
      useCdn: !token,
      perspective: "published",
    })
  : null;
