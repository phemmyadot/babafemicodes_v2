import { NextResponse, type NextRequest } from "next/server";
import { getPortfolio } from "@/lib/portfolio";

/**
 * Contact form for the Arcade edition: emails the message to the address in Sanity settings through Resend.
 * Needs RESEND_API_KEY. CONTACT_FROM must be an address on a domain verified in Resend; without it the sandbox sender
 * `onboarding@resend.dev` is used, which Resend only delivers to the account owner's own address.
 * shortcut: no rate limit beyond the honeypot and size caps, add one (per IP) if the form gets abused.
 */
const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (body: Record<string, unknown>, status: number) => NextResponse.json(body, { status });

export async function POST(req: NextRequest) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return json({ ok: false, error: "Email is not configured" }, 503);

  let data: Record<string, unknown>;
  try {
    data = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }
  // A hidden field only bots fill in: pretend it worked.
  if (typeof data.website === "string" && data.website) return json({ ok: true }, 200);

  const field = (k: keyof typeof LIMITS) => (typeof data[k] === "string" ? (data[k] as string).trim() : "");
  const [name, email, subject, message] = (["name", "email", "subject", "message"] as const).map(field);
  const tooLong = (["name", "email", "subject", "message"] as const).some((k, i) => [name, email, subject, message][i].length > LIMITS[k]);
  if (!name || !subject || !message || !EMAIL.test(email) || tooLong) return json({ ok: false, error: "Please check the form" }, 400);

  const { settings } = await getPortfolio();
  if (!settings.email) return json({ ok: false, error: "No recipient configured" }, 503);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
      to: [settings.email],
      reply_to: email,
      subject: `Portfolio: ${subject}`.slice(0, 200),
      text: `${message}\n\n— ${name} (${email})`,
    }),
  });
  if (!res.ok) return json({ ok: false, error: "Could not send" }, 502);
  return json({ ok: true }, 200);
}
