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
Sanity (project 3wxbn5sz / production) ──GROQ (one query)──▶ lib/portfolio.ts ──▶ app/page.tsx (Server Component, ISR 1h)
```

The site uses **the same Sanity dataset as the original babafemi.codes site**. The schemas in
`sanity/schemas/` are a **superset** of the originals (`profile`, `project`, `experience`, `skills`).
Every original field keeps its name. New fields are optional and labelled "(v2)" in the Studio, so
the old site keeps working while both sites are live.

| Section            | Sanity source                                                         |
| ------------------ | --------------------------------------------------------------------- |
| Hero               | `profile`: name, `headline` (v2) or first of `titles`, `bio[0]`, avatar  |
| Telemetry panels   | `profile.stats` (optional v2: `unit`, `detail`, `signal`)              |
| Systems            | `project` (`description` → card summary; optional v2 `body` case study) |
| Arsenal            | `skills` documents (one panel per category)                           |
| Service log        | `experience` (`bullets`, `current`)                                   |
| Credentials        | `profile.certifications` (label is parsed as "Title (CODE) \| Issuer"), `profile.education` (v2) |

## Studio

The Studio is embedded at **`/studio`**. To use it locally, add the dev URL (e.g. `http://localhost:3001`) as a
CORS origin with credentials at https://www.sanity.io/manage/project/3wxbn5sz/api, or choose
"Add development host" on the Studio's first screen. Do the same for the production domain after deploying.

## Migration (additive)

`npm run migrate` does a dry run, which Sanity validates without writing anything. `npm run migrate -- --apply` commits.
Re-running it is safe.

- `profile`: fills in `headline`, `phone`, `workStatus` and `education` with `setIfMissing`, so existing values are never changed.
- Adds the 5 work projects from the brief as new documents with `createIfNotExists` (IDs `project-v2-*`).
  They include every field the old site needs, so it will list them too.

You need an **Editor** token in `SANITY_API_WRITE_TOKEN`. The existing `SANITY_API_TOKEN` is read-only.

## On-demand revalidation

In Sanity → API → Webhooks, add `POST https://<domain>/api/revalidate` with the header
`x-revalidate-secret: <SANITY_REVALIDATE_SECRET>`.

## Structure

```
app/                 layout (fonts, pre-paint boot script), page (Server Component), api/revalidate
components/
  PortfolioShell     client root: shared state for the terminal, contact modal and project inspector
  hud/               the page sections: Hero, TelemetryBar, Projects, ProjectInspector, Arsenal, ServiceLog, Credentials, Uplink, ContactModal, …
  terminal/          Terminal (input/output, history, tab completion) and commands.tsx (command list)
  ui/                building blocks: Panel, Modal, HudButton, DecodeText, Sparkline, PortableBody
lib/                 types, Sanity client + GROQ query, Sanity → UI mapping (portfolio.ts), site constants
sanity/schemas/      Studio schemas (superset of the original site), sanity.config.ts at root
scripts/migrate-sanity  additive migration of the shared dataset (dry run by default)
```

To add a terminal command, add an entry to `COMMANDS` in `components/terminal/commands.tsx`. It will show up in `help` and in tab completion automatically.

## Notes

- The contact form is a **simulation**. After the "transmission" animation, it opens the visitor's email app with a message already filled in, so messages still arrive. To send email directly instead, replace the last step with an API route that uses a provider such as Resend or SES.
- Accessibility: if the visitor's system asks for reduced motion, the site skips the boot sequence, the text scramble effect and the live charts. The terminal and modals can be used with the keyboard (Esc closes them, and focus goes back to where it was).
