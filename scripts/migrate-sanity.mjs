/**
 * Additive migration of the existing babafemi.codes dataset to the v2 (HUD) schema.
 *
 * Safe to run against the dataset the old site still reads:
 *   - existing documents: only `setIfMissing` on new optional fields — no value is ever
 *     overwritten, renamed or removed;
 *   - new documents (the brief's work projects): `createIfNotExists` with fixed IDs,
 *     so re-running is a no-op. They carry every field the old site requires.
 *
 *   npm run migrate            # dry run: prints the plan, validates with Sanity, writes nothing
 *   npm run migrate -- --apply # commits
 *
 * Needs a token with write access: SANITY_API_WRITE_TOKEN (falls back to SANITY_API_TOKEN).
 */
import { createClient } from "@sanity/client";
import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const apply = process.argv.includes("--apply");
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const token = process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN;
if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or a token (SANITY_API_WRITE_TOKEN / SANITY_API_TOKEN)");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-02-19",
  token,
  useCdn: false,
});

const seed = JSON.parse(readFileSync(new URL("./data/brief-content.json", import.meta.url), "utf8"));

const key = (prefix, i) => `${prefix}${i}`.padEnd(12, "0").slice(0, 12);
const blocks = (paragraphs, prefix) =>
  paragraphs.map((text, i) => ({
    _type: "block",
    _key: key(prefix, i),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(`${prefix}s`, i), text, marks: [] }],
  }));

// Old schema's required `category`; picked per project from its stack.
const CATEGORY = {
  "rag-document-assistant": "fullstack",
  "enterprise-component-library": "mobile",
  "offline-first-mobile-core": "mobile",
  "ble-healthcare-monitoring": "mobile",
  "serverless-telemedicine": "mobile",
};

const tx = client.transaction();
const plan = [];

// 1. Profile: fill new v2 fields only where absent.
const profile = await client.fetch(`*[_type == "profile" && !(_id in path("drafts.**"))][0]{ _id, headline, phone, workStatus, education }`);
if (!profile) {
  console.error("No profile document found — aborting (this script never creates the profile).");
  process.exit(1);
}
const s = seed.settings;
const fill = {
  headline: s.title,
  phone: s.phone,
  workStatus: s.workStatus,
  education: seed.credentials
    .filter((c) => c.kind === "education")
    .map((c, i) => ({ _key: key("edu", i), _type: "object", degree: c.title, institution: c.issuer, year: c.year })),
};
const missing = Object.fromEntries(Object.entries(fill).filter(([k, v]) => profile[k] == null && v != null && !(Array.isArray(v) && !v.length)));
if (Object.keys(missing).length) {
  tx.patch(profile._id, (p) => p.setIfMissing(missing));
  plan.push(`profile ${profile._id}: setIfMissing ${Object.keys(missing).join(", ")}`);
} else {
  plan.push(`profile ${profile._id}: nothing to fill`);
}

// 2. Work projects from the brief → new documents.
const existing = new Set(await client.fetch(`*[_type == "project"].slug.current`));
seed.projects.forEach((p, i) => {
  const _id = `project-v2-${p.slug}`;
  if (existing.has(p.slug)) {
    plan.push(`project ${_id}: slug already used — skipped`);
    return;
  }
  tx.createIfNotExists({
    _id,
    _type: "project",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    client: p.client,
    role: p.role,
    description: p.summary,
    body: blocks(p.body, `b${i}`),
    metrics: p.metrics,
    tags: p.techStack,
    category: CATEGORY[p.slug] ?? "mobile",
    featured: p.featured,
    order: 10 + i,
  });
  plan.push(`project ${_id}: createIfNotExists "${p.title}"`);
});

console.log(`${apply ? "APPLYING" : "DRY RUN"} → ${projectId}/${client.config().dataset}\n  ${plan.join("\n  ")}`);
try {
  const res = await tx.commit({ dryRun: !apply, returnDocuments: false });
  console.log(apply ? `\nCommitted transaction ${res.transactionId}.` : "\nDry run validated by Sanity. Re-run with --apply to commit.");
} catch (err) {
  if (err?.details?.items?.some((i) => i.error?.type === "insufficientPermissionsError")) {
    console.error(
      `\nThe token is read-only. Create an Editor token at https://www.sanity.io/manage/project/${projectId}/api#tokens` +
        " and set SANITY_API_WRITE_TOKEN in .env.local. Nothing was written.",
    );
    process.exit(1);
  }
  throw err;
}
