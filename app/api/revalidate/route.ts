import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { PORTFOLIO_TAG } from "@/lib/sanity/queries";

/**
 * On-demand revalidation for Sanity webhooks.
 * Configure the webhook to POST here with header `x-revalidate-secret: <SANITY_REVALIDATE_SECRET>`
 * (or `?secret=` for quick manual testing).
 */
export async function POST(req: NextRequest) {
  const expected = process.env.SANITY_REVALIDATE_SECRET;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "SANITY_REVALIDATE_SECRET not set" }, { status: 500 });
  }

  const provided = req.headers.get("x-revalidate-secret") ?? req.nextUrl.searchParams.get("secret") ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  // expire: 0 → the next request refetches instead of serving stale-while-revalidate.
  revalidateTag(PORTFOLIO_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: PORTFOLIO_TAG, at: new Date().toISOString() });
}
