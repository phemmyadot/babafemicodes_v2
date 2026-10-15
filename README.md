# babafemicodes.dev

Portfolio for Babafemi Adojutelegan: Next.js 16 (App Router) + Sanity CMS + Tailwind + Framer Motion.
It has a HUD-style graphical interface and a terminal mode (open it with `` ` ``, `Ctrl/⌘+K`, or the **CLI** button).

```bash
npm install
npm run dev        # http://localhost:3000
```

All content comes from Sanity. The site has no local copy of the content: an empty field stays empty, and an empty section is hidden along with its nav tab. If Sanity can't be reached, the page errors, and Next keeps serving the last good version while it retries.

## Content flow

```
Sanity (babafemicodes_v2 · dishu3ld / production) ──GROQ (one query)──▶ lib/portfolio.ts ──▶ app/page.tsx (Server Component, ISR 1h)
```

Content lives in its own Sanity project, **babafemicodes_v2 (`dishu3ld`)**. Its content was copied from the original
babafemi.codes project (`3wxbn5sz`), including images and files; the old project was not changed. The schemas in
`sanity/schemas/` keep the original field names (`profile`, `project`, `experience`, `skills`) and add optional
fields labelled "(v2)" in the Studio.

| Section            | Sanity source                                                         |
| ------------------ | --------------------------------------------------------------------- |
| Hero               | `profile`: name, `headline` (v2) or first of `titles`, `bio[0]`, avatar  |
| Telemetry panels   | `profile.stats` (optional v2: `unit`, `detail`, `signal`)              |
| Systems            | `project` (`description` → card summary; optional v2 `body` case study) |
| Arsenal            | `skills` documents (one panel per category)                           |
| Service log        | `experience` (`bullets`, `current`)                                   |
| Credentials        | `profile.certifications` (label is parsed as "Title (CODE) \| Issuer"), `profile.education` (v2) |

## Studio

The Studio is embedded at **`/studio`**. CORS origins (with credentials) are already set for
`http://localhost:3000`, `http://localhost:3001` and `https://babafemicodes.dev`. Add any other host at
https://www.sanity.io/manage/project/dishu3ld/api.

## Migration (additive)

Already applied to `dishu3ld/production` on 2026-10-15. `npm run migrate` does a dry run, which Sanity validates without writing anything. `npm run migrate -- --apply` commits.
Re-running it is safe.

- `profile`: fills in `headline`, `phone`, `workStatus` and `education` with `setIfMissing`, so existing values are never changed.
- Adds the 5 work projects from the brief as new documents with `createIfNotExists` (IDs `project-v2-*`).

It uses the **Editor** token in `SANITY_API_WRITE_TOKEN`. The site itself uses only the read-only `SANITY_API_TOKEN`.

## On-demand revalidation

In Sanity → API → Webhooks, add `POST https://<domain>/api/revalidate` with the header
`x-revalidate-secret: <SANITY_REVALIDATE_SECRET>`.

## Deploy (babafemicodes.dev)

The site and Studio deploy together to Netlify, set up the same way as the original site (`netlify.toml`):

- Site: https://babafemicodes.dev
- Studio: https://babafemicodes.dev/studio (excluded in `robots.txt`)

1. **Netlify environment variables:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET=production`,
   `SANITY_API_TOKEN`, and `SANITY_REVALIDATE_SECRET` (the value in `.env.local`).
2. **Sanity CORS origins** (sanity.io/manage → API): `https://babafemicodes.dev` with credentials.
   The old Studio already ran on this origin, so it is probably set already. Add `http://localhost:3001` for local Studio use.
3. **Sanity webhook:** `POST https://babafemicodes.dev/api/revalidate`, header
   `x-revalidate-secret: <SANITY_REVALIDATE_SECRET>`, triggered on create/update/delete. Without it,
   edits take up to an hour to appear.

The domain is set in one place, `lib/site.ts`. The canonical URL, the sitemap, `robots.txt`, the top bar and the terminal prompt all read it from there.

## Structure

```
app/                 layout (fonts, pre-paint boot script), page (Server Component), api/revalidate
components/
  PortfolioShell     client root: shared state for the terminal, contact modal and project inspector
  hud/               the page sections: Hero, TelemetryBar, Projects, ProjectInspector, Arsenal, ServiceLog, Credentials, Uplink, ContactModal, …
  terminal/          Terminal (input/output, history, tab completion) and commands.tsx (command list)
  ui/                building blocks: Panel, Modal, HudButton, DecodeText, Sparkline, PortableBody
lib/                 types, Sanity client + GROQ query, Sanity → UI mapping (portfolio.ts), site constants
sanity/schemas/      Studio schemas, sanity.config.ts at root
scripts/migrate-sanity  adds the brief content to Sanity (dry run by default)
```

To add a terminal command, add an entry to `COMMANDS` in `components/terminal/commands.tsx`. It will show up in `help` and in tab completion automatically.

## Notes

- The contact form is a **simulation**. After the "transmission" animation, it opens the visitor's email app with a message already filled in, so messages still arrive. To send email directly instead, replace the last step with an API route that uses a provider such as Resend or SES.
- Accessibility: if the visitor's system asks for reduced motion, the site skips the boot sequence, the text scramble effect and the live charts. The terminal and modals can be used with the keyboard (Esc closes them, and focus goes back to where it was).
