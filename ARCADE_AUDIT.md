# Arcade edition audit

Hallmark audit (report only, no source changed). Date: 2026-11-16. Target: `/` (components/exe, app/exe.css).
Method: static `sloplint` (playful genre), `tsc --noEmit` (clean), and a live pass in a browser against `localhost:3000` at 1280 wide and 390 wide: boot, city, all six districts (via hash route), the Launch Pad mission panel, command palette, terminal, and one real door entry by keyboard.

Totals from the linter: 747 FAIL, 201 REFLEX, 27 WARN. Most of that is volume (662 are colour literals in scene art, 188 are off-scale spacing). The numbered gates below are Hallmark gate numbers.

## Status: suggested order #1 done (2026-11-16)

Fixed and re-checked in the browser and with `sloplint`: B1 (`overflow-x: clip` on html/body, every `100vw` replaced with `100%`), B2 (focus ring no longer transitions), B3 (disabled buttons now change fill, ink and cursor), B5 (`transition: all` listed explicitly), B6 for `.gw-bar`, `.boot-bar` and `lab-sweep` (now `transform`), B15 (`✔` replaced with the Lucide `Check` icon), B16 (`aria-hidden` on the bird SVG).
Not changed: `.room-bench` / `.room-monitor` still animate left, top, width and height in the lab finale (a one-off layout choreography that needs a rebuild to use transforms); B4 is a false positive: the interior bar sits in the dialog's top layer and covers `.x-bar`, so only one bar is ever visible.
Order #2 (2026-11-16): B7 (footstep timers are tracked and cancelled on scene change), B8 (door-entry timer cleared on unmount), B9 (visited-set updater is pure; storage write and the achievement toast moved to an effect), B11 (the sent state now shows the address as a mailto link, "No mail app? Write to ..."). B11 still has no send backend; the message still depends on the visitor's mail app.
Order #3 (2026-11-16): every font declaration under 11px raised to 11px (28 rules); `.ct-sign small` to 14px; on phones (max-width 760px) icon buttons, small buttons, the logo, tabs, career elevator buttons and form inputs are 44px, footer links 26px, and the Skill Tree zoom toolbar moved below the room hint. Still small by design: the Skill Tree overview map (a fit-to-screen thumbnail, about 7px text at 1280 and about 4px at 390; selecting a room zooms to about 10-11px), the lab motherboard silkscreen and slot labels (scaled art), career desk nameplates, and the Radio Tower dials, which sit inside the scaled scene art.
Skill Tree on phones (under 640px wide): same plan, re-planned as one tall column (lobby on top, rooms full width below, two chips per row) at about 0.89 scale, chip text about 10.8px. It now scrolls natively (a plain overflow scroller with iOS momentum) instead of being dragged by script, which re-rendered the whole plan on every touch move and was laggy on iPhone; room tabs and kiosk rows scroll to a room, the zoom toolbar is hidden. Wider screens keep the landscape plan with drag and zoom.
Launch Pad, Trophy Hall and Career Tower on phones (under 640px wide): the whole scene is scaled to fit the screen (about 0.32 to 0.38) instead of being cropped and followed by a camera. Rockets and plaques stand closer together, labels and plaque text are set larger in design units and wrap, and the tower is centred below the floor buttons. Career Tower reserves the top 120px and sizes to the remaining height so the lobby is never cut off on short phones, and slides up when a floor's panel is open so that floor stays above it. Not tried on a real phone: the rocket launch animation in this fitted view.
Linter after the order #1 fixes: 727 FAIL (was 747), 201 REFLEX, 27 WARN. Gates 15, 33, 34, 39a, 30a are clear; 10a has one finding left (above).

## Bugs

| # | Where | What | Confidence |
|---|-------|------|------------|
| B1 | `exe.css` :653 :671 :986 :1242 :1839 :2345 :3388 | `100vw` and `calc(100vw - ...)` widths on dialogs and interiors (gate 34). No sideways scroll was seen at 1280 or 390, but `html` and `body` compute `overflow-x: visible`, so any scrollbar on a real desktop browser shifts the layout. | Linter + computed style; overflow not reproduced |
| B2 | `exe.css` :388 :5404 | `.x-card` and `.ct-term` transition `box-shadow` while `:focus-visible` sets it, so the keyboard focus ring fades in (gate 15). | Linter |
| B3 | `exe.css` :1975 :4408 :5590 | Disabled buttons (`.gw-enter`, `.sr-zoom button`, `.ct-btn`) are distinguished by opacity only (gate 39a). | Linter |
| B4 | `exe.css` :1846 | Two sticky `top:0` bars (`.x-bar` and `.x-interior-bar`) with no offset (gate 56). | Linter |
| B5 | `exe.css` :4078 :4288 :4398 :4437 | `transition: all` on `.sr-*` controls. | Linter |
| B6 | `exe.css` :1817 :2604 :3803 :4762 | Width or left animated (`.gw-bar span`, `.boot-bar span`, `.room-bench`, `lab-sweep`), causing layout work every frame. | Linter |
| B7 | `components/exe/audio.ts:609` | `sfx.walk` schedules one `setTimeout` per footstep and never clears them. Steps keep firing after the scene exits or unmounts. | Code read, not reproduced |
| B8 | `components/exe/ExePortfolio.tsx:417` | The 430ms door-entry timeout is not cleared on unmount, and `entering.current` can stay true. | Code read, not reproduced |
| B9 | `components/exe/ExePortfolio.tsx:476-483` | `setVisited` updater writes `localStorage` and calls `setToast` inside the reducer. Impure; StrictMode double-invokes it. | Code read |
| B10 | `components/exe/audio.ts`, `crt-sound.ts` | Two separate `AudioContext`s. The CRT sound bypasses the master gain and compressor. | Code read |
| B11 | `Radio.tsx:138-168` | The contact form is `mailto:` only and fires 3.5s after the animation starts. The status line says "Signal locked · message ready in your mail app" even on a device with no mail client, so the message is lost. The code carries a `shortcut:` comment acknowledging there is no backend. | Code read + live form |
| B12 | `app/page.tsx` | `themeColor` is `#080D18`, but the page `--void` is `#12082e`. Mobile browser chrome is a different colour from the page. | Code read |
| B13 | Boot screen | The progress bar was about 78% full while the label already read "SYSTEM READY.". | Seen once in a screenshot |
| B14 | Mobile city (390) | `Enter Skill Tree` (a building button) and the bottom-nav "Skills" item did not accept a click from the automation (outside the viewport / not visible). The route itself works by hash. Could be a tooling limit, test by hand on a phone. | Needs a manual check |
| B15 | `exe.css` :334, `.x-achieve::before` | `✔` used as an icon (gate 30a); `✔` also in `Radio.tsx` status text. | Linter |
| B16 | `GameWorld.tsx:213` | Decorative `<svg>` without `aria-hidden` or label (gate 33). | Linter |
| B17 | Command palette | Mission options announce the entire tech stack as the accessible name (about 200 characters each). | Live (accessibility tree) |
| B18 | Skill Tree data | "AWS Cognito" is listed under both Backend & Cloud and Data & Security; "Automated Testing" is a generic filler item beside named tools. | Live |
| B19 | Dev only | The Next.js dev button covers the bottom-nav "City" item on mobile and the floor selector in the Career Tower. It will not ship. | Live |

## Small type and touch targets (live measurements)

| View | Text under 11px | Smallest text | Buttons/links under 44px |
|------|-----------------|---------------|--------------------------|
| Profile 1280 / 390 | 8 / 14 | 8px | - / 15 |
| Skills 1280 / 390 | 38 / 47 | 9px | - / 31 |
| Missions 1280 / 390 | 0 / 9 | 11px / 10px | - / 13 |
| Career 1280 / 390 | 4 / 13 | 9px | - / 20 |
| Awards 1280 / 390 | 0 / 9 | 11px / 10px | - / 13 |
| Contact 1280 / 390 | 0 / 9 | 11px / 10px | - / 16 |

The Skill Tree room cards render at about 7 to 9px at 1280 and are not readable without zooming.

## Slop

| Gate | Count | What |
|------|-------|------|
| 2a purple gradients | 12 | `.gw-sky`, `.gw-ground`, `.boot-floor`, `.lab-board`, the dialog backdrop, `.gl-wall`, `.room-door-gap` and others. One purple/pink/cyan neon palette repeats across every scene. |
| 67 tracked-caps labels | 35 | Kickers, tabs, pills, footer and sign text, down to 8 to 10px (`.pcb-io b`, `.sr-kiosk-sub`, `.lab-facts dt`). |
| 54 eyebrows before headings | 6 | "Personal engineering universe", "Mission of", "Stage", "Floor", "Mission", "Available for opportunities" (`ExePortfolio.tsx:160`, `ExeScreens.tsx:209` `:254`, `Tower.tsx:490`, `Hangar.tsx:405`, `Lab.tsx:511`). |
| 64 mono as label voice | 13 | `.x-kicker`, `.x-label`, `.sr-room-badge`, `.rt-fields label` and others. |
| 29 glow / glass | 15 | Zero-offset coloured glows (`.gw-moon`, `.gw-board`, `.hg-holo`, `.rt-term` and others), plus a blurred glass backdrop. |
| 11 hover lift | 4 selectors | Same lift on `.x-btn` and `.x-card`. |
| 63 middle-dot strings | 2 + footer | "← → walk · Enter go inside · or click anywhere" (`GameWorld.tsx:692`), "B-ADO · MOTHERBOARD · REV 8" (`Lab.tsx:372`), the footer "ELECTRIC EDITION · KINETIC EDITION · ..." which wraps and leaves a dangling "· IDE EDITION" on mobile. |
| 3 side stripes | 7 | `.gw-blimp::after`, `.room-shelf`, `.ct-shaft`, `.ct-floor`, `.lab-art-ssd`. |
| 7a pure black/white | 6 | `#000`, `#fff` in `.exe-boot`, `.gw-bubble`, `.x-toast`, `.rt-target i`, `.hg-flash`. |
| 48 colour literals | 662 | Scene art (acceptable) and UI chrome (`#0c0524`, `#12082e`, rgba panels) that should use `--void` and `--panel`. |
| 24b off-scale spacing | 188 | 6, 10, 14, 18px gaps and paddings throughout. Cosmetic. |
| Floor 4 | 1 | No `overflow-x: clip` on `html` or `body`. |
| Floor 20 | 1 | No Hallmark stamp on line 1 of the CSS. |

Density: the city first screen carries roughly 90 words at 1280 (profile card, stats chip, speech bubble, billboard with four stat tiles, hint pill, footer), over the budget of about 80. The stat figures (8+ years, 10 teams, 10k+ users, 40m iOS release) are the owner's own and should be confirmed.

## What works (keep)

- Hash routing: all six district routes load and `Back` works; `World Explorer` toast fires once all six are visited.
- Boot intro skips automatically for reduced-motion and returning visitors; no flash.
- Keyboard play: ArrowRight walks, `Enter` at a building enters the door (Launch Pad reached, route `#/missions`).
- Command palette (Ctrl/Cmd+K) lists every section and mission; terminal (`~`) accepts `help`, `whoami`, `skills`, `mission <id>`, rejects unknown commands cleanly ("command not found") including `sudo rm -rf /`.
- Real project content is used; no invented testimonials or logo walls.
- No sideways overflow at 1280 or 390 in any district.

## Not covered

- Doors were entered by hash for five of the six districts; only the Launch Pad was entered by walking and pressing Enter.
- Audio output, the resume download, the external links and the mail hand-off were not exercised.
- Gate 12 (hero fold) and gate 44 (1920 width) were not judged; the browser viewport height read 577px in some captures even though 1280x800 was requested, so some tall scenes (Career Tower) were seen cropped.
- Linter render tier did not run (no `puppeteer-core`).

## Suggested order

1. B1 to B6, B15, B16 (mechanical CSS and markup fixes).
2. B7, B8, B9 (timer cleanups and the impure updater), B11 (add a send route or a visible fallback address).
3. Raise small type (Skill Tree, `.pcb-*`, `.sr-*`, `.lab-facts`) and the mobile tap targets.
4. Remove eyebrows and middle-dot strings; one accent; fewer glows.
5. Move UI-chrome colours into tokens.
