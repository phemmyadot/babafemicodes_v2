/** Posts a contact message to /api/contact (Resend). Resolves false on any failure so callers can fall back to a mailto link. */
export async function sendContact(p: { name: string; email: string; subject: string; message: string }): Promise<boolean> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    return res.ok;
  } catch {
    return false;
  }
}
