import {
  CONTACT,
  CREDENTIALS,
  EXPERIENCE,
  MARQUEE_A,
  MARQUEE_B,
  MODULES,
  STACK,
  STATS,
  type ModuleViz,
} from "./content";
import { ArrowRight, Download, ExternalLink, ShieldCheck, Verified } from "./icons";

function Radar() {
  return (
    <div className="hud-panel">
      <div className="hud-head">
        <span>Orbital scan // sink</span>
        <span className="live">
          <i aria-hidden="true" /> Live
        </span>
      </div>
      <div className="radar">
        <div className="radar-orbit" aria-hidden="true" />
        <svg viewBox="0 0 300 300" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="sweepGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5FF3F0" stopOpacity="0.35" />
              <stop offset="1" stopColor="#5FF3F0" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="#21414A" strokeWidth="1">
            <circle cx="150" cy="150" r="134" />
            <circle cx="150" cy="150" r="98" />
            <circle cx="150" cy="150" r="62" />
            <circle cx="150" cy="150" r="26" />
          </g>
          <g stroke="#1B343C" strokeWidth="1" strokeDasharray="2 6">
            <path d="M150 16v268M16 150h268M55 55l190 190M245 55 55 245" />
          </g>
          <g fill="#2C4C55">
            <circle cx="150" cy="16" r="1.6" />
            <circle cx="150" cy="284" r="1.6" />
            <circle cx="16" cy="150" r="1.6" />
            <circle cx="284" cy="150" r="1.6" />
          </g>
          <g className="sweep">
            <path d="M150 150 L150 16 A134 134 0 0 1 266 83 Z" fill="url(#sweepGrad)" />
            <line x1="150" y1="150" x2="150" y2="16" stroke="#5FF3F0" strokeWidth="1.4" />
          </g>
          <g>
            <circle className="blip" cx="206" cy="92" r="4" fill="#C6FF6E" />
            <circle className="blip" cx="102" cy="186" r="3" fill="#5FF3F0" />
            <circle className="blip" cx="178" cy="214" r="3.4" fill="#5FF3F0" />
            <circle cx="150" cy="150" r="3" fill="#C6FF6E" />
          </g>
          <text
            x="150"
            y="292"
            textAnchor="middle"
            style={{ fontFamily: "var(--k-font-mono)" }}
            fontSize="8"
            letterSpacing="2"
            fill="#5E747D"
          >
            RANGE 40KM
          </text>
        </svg>
      </div>
      <div className="hud-readouts">
        <div>
          <span>Release Δ</span>
          <b>5h → 40m</b>
        </div>
        <div>
          <span>DS adoption</span>
          <b>10 teams</b>
        </div>
        <div>
          <span>Apps</span>
          <b>10+</b>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero" id="mission">
      <div className="wrap">
        <p className="hero-kicker">
          <span className="bar" aria-hidden="true" />
          <span data-scramble>Portfolio · 2026 · Chicago_IL</span>
        </p>

        <h1 className="hero-name" aria-label="Babafemi Adojutelegan">
          <span className="split-line" aria-hidden="true">
            Babafemi
          </span>
          <span className="split-line line-2" aria-hidden="true">
            Adojutelegan
          </span>
        </h1>

        <div className="hero-meta">
          <span className="role-tag">
            <span className="dot" aria-hidden="true" /> Senior Frontend &amp; Mobile Engineer{" "}
            <span className="sep" aria-hidden="true">
              /
            </span>{" "}
            React Native &amp; Design Systems
          </span>
          <span className="chip">Chicago, IL</span>
          <span className="chip">US Permanent Resident</span>
          <span className="chip live">Open to Work</span>
        </div>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="hero-lede">
              Eight years turning hard product constraints into interfaces people trust — a{" "}
              <strong>React Native design system now shared by ten teams</strong>, and an iOS release
              pipeline cut from five hours to forty minutes.
            </p>

            <div className="stat-row">
              {STATS.map((stat) => (
                <div className="stat" key={stat.label}>
                  <span className="num" data-count={stat.value} data-suffix={stat.suffix}>
                    {stat.display}
                  </span>
                  <span className="lbl">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="cta-row">
              <a className="btn btn-primary magnetic" href={CONTACT.resume} download data-resume>
                <Download />
                Download Audited Resume (PDF)
              </a>
              <a className="btn btn-ghost magnetic" href="#modules">
                Inspect Modules
                <ArrowRight />
              </a>
              <a
                className="btn-text"
                href={CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <ExternalLink size={12} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a
                className="btn-text"
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
                <ExternalLink size={12} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <Radar />
          </div>
        </div>
      </div>
    </section>
  );
}

function Marquee({ items, reverse }: { items: typeof MARQUEE_A; reverse?: boolean }) {
  return (
    <div className={reverse ? "marquee reverse" : "marquee"} aria-hidden="true">
      <div className="marquee-track">
        <div className="marquee-seg">
          {items.map((item) => (
            <span className={item.hot ? "hot" : undefined} key={item.label}>
              {item.label}
            </span>
          ))}
        </div>
        <div className="marquee-seg marquee-clone">
          {items.map((item) => (
            <span className={item.hot ? "hot" : undefined} key={`${item.label}-clone`}>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Marquees() {
  return (
    <>
      <Marquee items={MARQUEE_A} />
      <Marquee items={MARQUEE_B} reverse />
    </>
  );
}

function FlowSenseViz() {
  return (
    <svg viewBox="0 0 480 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="ecgFade2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5FF3F0" stopOpacity="0" />
          <stop offset="0.2" stopColor="#5FF3F0" stopOpacity="0.9" />
          <stop offset="0.8" stopColor="#5FF3F0" stopOpacity="0.9" />
          <stop offset="1" stopColor="#5FF3F0" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g stroke="#1E3A42" strokeWidth="1">
        <path d="M24 52h432M24 96h432M24 140h432" />
      </g>
      <g stroke="#173038" strokeWidth="1" strokeDasharray="2 7">
        <path d="M24 70v50M100 70v50M176 70v50M252 70v50M328 70v50M404 70v50M456 70v50" />
      </g>
      <path
        d="M20 110h46l9-26 11 58 13-44 11 16 16-4 10 7h58l9-30 11 62 13-48 11 18 16-6 10 8h62l9-24 11 56 13-42 11 16 16-4 10 6h68"
        fill="none"
        stroke="url(#ecgFade2)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <g>
        <circle cx="396" cy="46" r="7" fill="#05080C" stroke="#5FF3F0" strokeWidth="1.4" />
        <circle cx="396" cy="46" r="2.4" fill="#C6FF6E" />
        <path
          d="M407 40a14 14 0 0 1 0 20M414 33a24 24 0 0 1 0 34"
          fill="none"
          stroke="#5FF3F0"
          strokeOpacity="0.5"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function DesignSystemViz() {
  return (
    <svg viewBox="0 0 480 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g stroke="#1E3A42" strokeWidth="1">
        <rect x="34" y="26" width="116" height="138" rx="2" fill="#05080C" />
        <rect x="182" y="26" width="116" height="138" rx="2" fill="#05080C" />
        <rect x="330" y="26" width="116" height="138" rx="2" fill="#05080C" />
      </g>
      <g fill="#142831">
        <rect x="46" y="48" width="92" height="12" rx="1" />
        <rect x="46" y="68" width="70" height="12" rx="1" />
        <rect x="46" y="108" width="92" height="12" rx="1" />
        <rect x="46" y="128" width="62" height="12" rx="1" />
        <rect x="194" y="48" width="92" height="12" rx="1" />
        <rect x="194" y="68" width="70" height="12" rx="1" />
        <rect x="194" y="108" width="92" height="12" rx="1" />
        <rect x="194" y="128" width="62" height="12" rx="1" />
        <rect x="342" y="48" width="92" height="12" rx="1" />
        <rect x="342" y="68" width="70" height="12" rx="1" />
        <rect x="342" y="108" width="92" height="12" rx="1" />
        <rect x="342" y="128" width="62" height="12" rx="1" />
      </g>
      <g fill="rgba(95,243,240,0.16)" stroke="#5FF3F0" strokeOpacity="0.55">
        <rect x="46" y="88" width="92" height="12" rx="1" />
        <rect x="194" y="88" width="92" height="12" rx="1" />
        <rect x="342" y="88" width="92" height="12" rx="1" />
      </g>
      <g stroke="#C6FF6E" strokeOpacity="0.4" strokeDasharray="3 4">
        <path d="M150 94h32M298 94h32" />
      </g>
    </svg>
  );
}

function RagViz() {
  return (
    <svg viewBox="0 0 480 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect x="28" y="22" width="206" height="146" rx="2" fill="#05080C" stroke="#1E3A42" />
      <g fill="#172B34">
        <rect x="44" y="44" width="120" height="6" rx="2" />
        <rect x="44" y="58" width="160" height="6" rx="2" />
        <rect x="44" y="72" width="96" height="6" rx="2" />
        <rect x="44" y="92" width="150" height="6" rx="2" />
        <rect x="44" y="106" width="168" height="6" rx="2" />
        <rect x="44" y="120" width="112" height="6" rx="2" />
        <rect x="44" y="140" width="140" height="6" rx="2" />
      </g>
      <polygon
        points="38,84 220,78 226,120 44,128"
        fill="rgba(95,243,240,0.12)"
        stroke="#5FF3F0"
        strokeOpacity="0.8"
      />
      <g fill="#05080C" stroke="#5FF3F0" strokeWidth="1.4">
        <circle cx="38" cy="84" r="3" />
        <circle cx="220" cy="78" r="3" />
        <circle cx="226" cy="120" r="3" />
        <circle cx="44" cy="128" r="3" />
      </g>
      <path d="M232 104h26" stroke="#C6FF6E" strokeOpacity="0.5" strokeDasharray="3 4" />
      <rect x="262" y="58" width="188" height="52" rx="2" fill="#0A1017" stroke="#1E3A42" />
      <rect x="276" y="72" width="112" height="6" rx="2" fill="#172B34" />
      <rect x="276" y="86" width="74" height="6" rx="2" fill="#172B34" />
      <rect
        x="262"
        y="122"
        width="150"
        height="40"
        rx="2"
        fill="rgba(198,255,110,0.06)"
        stroke="#C6FF6E"
        strokeOpacity="0.35"
      />
      <rect x="276" y="136" width="92" height="6" rx="2" fill="rgba(198,255,110,0.3)" />
    </svg>
  );
}

function KoilViz() {
  return (
    <svg viewBox="0 0 480 190" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g stroke="#1E3A42" strokeWidth="1">
        <path d="M30 40h420M30 78h420M30 116h420M30 154h420" />
      </g>
      <g>
        <line x1="60" y1="126" x2="60" y2="154" stroke="#E07A7A" strokeWidth="1.4" />
        <rect x="55" y="132" width="10" height="14" fill="#E07A7A" />
        <line x1="88" y1="112" x2="88" y2="146" stroke="#5FF3F0" strokeWidth="1.4" />
        <rect x="83" y="118" width="10" height="20" fill="#5FF3F0" />
        <line x1="116" y1="98" x2="116" y2="134" stroke="#5FF3F0" strokeWidth="1.4" />
        <rect x="111" y="104" width="10" height="20" fill="#5FF3F0" />
        <line x1="144" y1="104" x2="144" y2="140" stroke="#E07A7A" strokeWidth="1.4" />
        <rect x="139" y="110" width="10" height="18" fill="#E07A7A" />
        <line x1="172" y1="88" x2="172" y2="124" stroke="#5FF3F0" strokeWidth="1.4" />
        <rect x="167" y="94" width="10" height="22" fill="#5FF3F0" />
        <line x1="200" y1="72" x2="200" y2="110" stroke="#5FF3F0" strokeWidth="1.4" />
        <rect x="195" y="78" width="10" height="24" fill="#5FF3F0" />
        <line x1="228" y1="80" x2="228" y2="118" stroke="#E07A7A" strokeWidth="1.4" />
        <rect x="223" y="86" width="10" height="20" fill="#E07A7A" />
        <line x1="256" y1="62" x2="256" y2="100" stroke="#5FF3F0" strokeWidth="1.4" />
        <rect x="251" y="68" width="10" height="24" fill="#5FF3F0" />
        <line x1="284" y1="50" x2="284" y2="90" stroke="#C6FF6E" strokeWidth="1.4" />
        <rect x="279" y="56" width="10" height="26" fill="#C6FF6E" />
        <line x1="312" y1="58" x2="312" y2="98" stroke="#E07A7A" strokeWidth="1.4" />
        <rect x="307" y="64" width="10" height="22" fill="#E07A7A" />
        <line x1="340" y1="40" x2="340" y2="82" stroke="#5FF3F0" strokeWidth="1.4" />
        <rect x="335" y="46" width="10" height="26" fill="#5FF3F0" />
        <line x1="368" y1="34" x2="368" y2="74" stroke="#C6FF6E" strokeWidth="1.4" />
        <rect x="363" y="40" width="10" height="24" fill="#C6FF6E" />
        <line x1="396" y1="46" x2="396" y2="88" stroke="#E07A7A" strokeWidth="1.4" />
        <rect x="391" y="52" width="10" height="24" fill="#E07A7A" />
        <line x1="424" y1="34" x2="424" y2="74" stroke="#5FF3F0" strokeWidth="1.4" />
        <rect x="419" y="40" width="10" height="26" fill="#5FF3F0" />
      </g>
    </svg>
  );
}

const VIZ_CAPTIONS: Record<ModuleViz, { start: string; end: string }> = {
  flowsense: { start: "Secure BLE link", end: "Sensor · streaming" },
  "design-system": { start: "Multi-tenant", end: "10 teams" },
  rag: { start: "Polygon overlay", end: "Streaming" },
  koil: { start: "Equities · crypto", end: "Screener" },
};

function ModuleVisual({ viz }: { viz: ModuleViz }) {
  const caption = VIZ_CAPTIONS[viz];
  return (
    <div className="module-viz" aria-hidden="true">
      {viz === "flowsense" && <FlowSenseViz />}
      {viz === "design-system" && <DesignSystemViz />}
      {viz === "rag" && <RagViz />}
      {viz === "koil" && <KoilViz />}
      <span className="scan-beam" />
      <span className="viz-caption start">{caption.start}</span>
      <span className="viz-caption end">{caption.end}</span>
    </div>
  );
}

export function Modules() {
  return (
    <section className="section section-ruled" id="modules">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <p className="sec-kicker">
              <span className="idx">02</span> Selected work
            </p>
            <h2>Mission modules</h2>
          </div>
          <p className="sec-note">
            Four systems where frontend craft met hard constraints: encrypted medical hardware, ten
            teams on one component contract, and real-time document verification.
          </p>
        </div>

        <div className="module-grid">
          {MODULES.map((module) => (
            <article className="module reveal" data-case-handle key={module.caseId}>
              <div className="module-frame">
                <div className="module-top">
                  <span className="code">{module.code}</span>
                  <span>{module.category}</span>
                </div>
                <ModuleVisual viz={module.viz} />
                <div className="module-body">
                  <h3>{module.title}</h3>
                  <div className="module-metric">
                    <span className="val">{module.metric}</span>
                    <span className="lbl">{module.metricLabel}</span>
                  </div>
                  <p className="module-desc">{module.description}</p>
                  <div className="tags">
                    {module.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="module-foot">
                  <span className="module-open">
                    Open dossier
                    <ArrowRight size={14} />
                  </span>
                  <span className="module-year">{module.year}</span>
                </div>
              </div>
              <span className="glare" aria-hidden="true" />
              <button className="module-hit" type="button" data-case={module.caseId}>
                <span className="sr-only">{module.hitLabel}</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stack() {
  return (
    <section className="section section-ruled" id="stack">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <p className="sec-kicker">
              <span className="idx">03</span> Technical arsenal
            </p>
            <h2>Loadout</h2>
          </div>
          <p className="sec-note">
            Depth in mobile and design systems, with enough range to own the release pipeline and
            the telemetry around it.
          </p>
        </div>

        <div className="stack-grid reveal">
          {STACK.map((group) => (
            <div className="stack-cell" key={group.title}>
              <p className="idx">{group.index}</p>
              <h3>{group.title}</h3>
              <div className="tags">
                {group.skills.map((skill) => (
                  <span className="tag" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Timeline() {
  return (
    <section className="section section-ruled" id="timeline">
      <div className="wrap">
        <div className="sec-head reveal">
          <div>
            <p className="sec-kicker">
              <span className="idx">04</span> Experience &amp; credentials
            </p>
            <h2>Flight log</h2>
          </div>
          <p className="sec-note">
            From enterprise web foundations to regulated mobile hardware, with the certifications to
            match the architecture work.
          </p>
        </div>

        <div className="timeline-grid">
          <div className="timeline reveal">
            {EXPERIENCE.map((entry) => (
              <article className="entry" key={entry.company}>
                <span className="node" aria-hidden="true" />
                <div className="entry-head">
                  <h3>{entry.company}</h3>
                  <span className="entry-role">{entry.role}</span>
                </div>
                <p className="entry-desc">{entry.description}</p>
                <div className="tags">
                  {entry.tags.map((tag) => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="cred-list reveal">
            {CREDENTIALS.map((credential) => (
              <article className="cred" key={credential.title}>
                <div className="cred-top">
                  <span className="cred-sigil" aria-hidden="true">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h3>{credential.title}</h3>
                    <p className="issuer">{credential.issuer}</p>
                    <span className="verified">
                      <Verified size={12} />
                      Verified
                    </span>
                  </div>
                </div>
                <a
                  className="cred-link"
                  href={credential.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {credential.linkLabel}
                  <ExternalLink size={12} />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Uplink() {
  return (
    <section className="section section-ruled" id="uplink">
      <div className="wrap">
        <div className="uplink reveal">
          <div>
            <p className="sec-kicker">
              <span className="idx">05</span> Uplink
            </p>
            <h2>Open a channel</h2>
            <p className="lede">
              Open to senior frontend and mobile roles. Based in Chicago and available across US time
              zones.
            </p>
            <div className="signal" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>

          <div className="contact-rows">
            <div className="contact-row">
              <span className="contact-label">Email</span>
              <a className="contact-value" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
              <button
                className="copy-btn"
                type="button"
                data-copy={CONTACT.email}
                aria-label="Copy email address"
              >
                <svg
                  className="od-icon icon-16 icon-copy"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
                <svg
                  className="od-icon icon-16 icon-check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m4 12 5 5L20 6" />
                </svg>
              </button>
            </div>
            <div className="contact-row">
              <span className="contact-label">Phone</span>
              <a className="contact-value" href={`tel:${CONTACT.phoneHref}`}>
                {CONTACT.phone}
              </a>
              <button
                className="copy-btn"
                type="button"
                data-copy={CONTACT.phone}
                aria-label="Copy phone number"
              >
                <svg
                  className="od-icon icon-16 icon-copy"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect x="9" y="9" width="11" height="11" rx="2" />
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" />
                </svg>
                <svg
                  className="od-icon icon-16 icon-check"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="m4 12 5 5L20 6" />
                </svg>
              </button>
            </div>

            <div className="social-row">
              <a
                className="btn btn-ghost"
                href={CONTACT.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <ExternalLink size={14} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a
                className="btn btn-ghost"
                href={CONTACT.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
                <ExternalLink size={14} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <span>© 2026 Babafemi Adojutelegan · Kinetic edition</span>
        <div className="footer-links">
          <a href="/">Electric edition</a>
          <a href="/classic">Classic edition</a>
          <a href="#mission">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
