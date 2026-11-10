import { Fragment } from "react";
import {
  CONTACT,
  CREDENTIALS,
  LOG,
  RIBBON_A,
  RIBBON_B,
  SHEETS,
  STACK,
  STATS,
} from "./content";
import {
  ArrowIcon,
  CheckIcon,
  ContactSticker,
  CopyIcon,
  ExternalIcon,
  HeroPoster,
  SheetVisual,
  StackSpin,
} from "./ElectricArt";

function Ribbon({
  items,
  tone,
  reverse = false,
}: {
  items: readonly string[];
  tone: "acid" | "coral";
  reverse?: boolean;
}) {
  return (
    <div
      className={`ribbon ribbon-${tone}${reverse ? " ribbon-reverse" : ""}`}
      aria-hidden="true"
    >
      <div className="ribbon-track">
        {[0, 1].map((segment) => (
          <div className={`ribbon-seg${segment === 1 ? " clone" : ""}`} key={segment}>
            {items.map((item) => (
              <Fragment key={item}>
                <span>{item}</span>
                <i>✳</i>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" aria-hidden="true" />
            Portfolio · 2026 · Chicago, IL
          </p>

          <h1 className="hero-name" aria-label="Babafemi Adojutelegan">
            <span className="line" aria-hidden="true">
              Babafemi
            </span>
            <span className="line line-alt" aria-hidden="true">
              Adojutelegan
            </span>
          </h1>

          <p className="hero-role">
            Senior frontend &amp; mobile engineer
            <br />
            <em>React Native · React · design systems</em>
          </p>

          <p className="hero-lede">
            Eight years turning hard product constraints into interfaces people trust — a React
            Native design system now shared by <strong>ten teams</strong>, and an iOS release
            pipeline cut from five hours to <strong>forty minutes</strong>.
          </p>

          <div className="hero-cta">
            <span className="magnetic">
              <a className="btn btn-acid" href="#work">
                <span className="roll">
                  <span>See the work</span>
                  <span aria-hidden="true">See the work</span>
                </span>
                <ArrowIcon />
              </a>
            </span>
            <span className="magnetic">
              <a className="btn btn-outline" href={CONTACT.resume} download data-resume>
                Download resume
              </a>
            </span>
          </div>

          <div className="hero-badges">
            <span className="sticker sticker-acid">Open to work</span>
            <span className="sticker">Chicago, IL</span>
            <span className="sticker">US permanent resident</span>
            <span className="sticker sticker-mint">8+ years</span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <HeroPoster />
          <span className="art-tag art-tag-a">
            Frontend
            <br />× mobile
          </span>
          <span className="art-tag art-tag-b">
            Ship it
            <br />
            loud
          </span>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats" aria-label="Career numbers">
      <div className="wrap stats-grid">
        {STATS.map((stat) => (
          <div className="stat" key={stat.label}>
            <span
              className="stat-num"
              data-count={stat.value}
              data-suffix={stat.suffix || undefined}
            >
              {stat.display}
            </span>
            <span className="stat-lbl">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Work() {
  return (
    <section className="work" id="work">
      <div className="wrap">
        <div className="section-head">
          <p className="sec-index">01 / Selected work</p>
          <h2>
            Built to be <em>felt</em>
          </h2>
          <p className="sec-note">
            Four systems where the interface had to carry real weight: encrypted medical hardware,
            ten teams on one component contract, and documents that prove themselves.
          </p>
        </div>

        <div className="sheets">
          {SHEETS.map((sheet) => (
            <article className={`sheet sheet-${sheet.accent}`} key={sheet.caseId}>
              <div className="sheet-top">
                <span>{sheet.code}</span>
                <span>{sheet.category}</span>
                <span className="sheet-star" aria-hidden="true">
                  ✳
                </span>
              </div>
              <div className="sheet-grid">
                <div className="sheet-copy">
                  <h3>{sheet.title}</h3>
                  <p className="sheet-metric">
                    {sheet.metric} <span>{sheet.metricLabel}</span>
                  </p>
                  <p className="sheet-desc">{sheet.description}</p>
                  <div className="chips">
                    {sheet.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <button
                    className={`btn btn-${sheet.action} sheet-open`}
                    type="button"
                    data-case={sheet.caseId}
                  >
                    Open dossier
                    <ArrowIcon size={14} />
                  </button>
                </div>
                <button
                  className="sheet-visual"
                  type="button"
                  data-case={sheet.caseId}
                  data-cursor="view"
                  aria-label={sheet.visualLabel}
                >
                  <SheetVisual caseId={sheet.caseId} />
                  <span className="visual-tag">{sheet.visualTag}</span>
                  <span className="visual-tag end">{sheet.visualTagEnd}</span>
                </button>
              </div>
              <div className="sheet-foot">
                <span>{sheet.foot}</span>
                <span>{sheet.year}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stack() {
  return (
    <section className="stack" id="stack">
      <div className="wrap">
        <div className="section-head">
          <p className="sec-index">02 / Technical arsenal</p>
          <h2>
            The <em>loadout</em>
          </h2>
          <p className="sec-note">
            Depth in mobile and design systems, with enough range to own the release pipeline and
            the telemetry around it.
          </p>
        </div>

        <div className="stack-grid">
          {STACK.map((group) => (
            <div className={`stack-card stack-${group.accent}`} key={group.number}>
              <p className="stack-num">{group.number}</p>
              <h3>{group.title}</h3>
              <div className="chips">
                {group.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <StackSpin />
    </section>
  );
}

function Log() {
  return (
    <section className="log" id="log">
      <div className="wrap">
        <div className="section-head light">
          <p className="sec-index">03 / Experience &amp; credentials</p>
          <h2>
            Flight <em>log</em>
          </h2>
          <p className="sec-note">
            From enterprise web foundations to regulated mobile hardware, with the certifications
            to match the architecture work.
          </p>
        </div>

        <div className="log-rows">
          {LOG.map((entry, index) => (
            <article className="log-row" key={entry.company}>
              <span className="log-num" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="log-main">
                <div className="log-head">
                  <h3>{entry.company}</h3>
                  <span>{entry.role}</span>
                </div>
                <p>{entry.description}</p>
                <div className="chips">
                  {entry.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="creds">
          {CREDENTIALS.map((credential) => (
            <article className="cred" key={credential.title}>
              <div className="cred-top">
                <span className="cred-mark" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <h3>{credential.title}</h3>
                  <p>{credential.issuer}</p>
                </div>
              </div>
              <a
                className="cred-link"
                href={credential.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {credential.linkLabel}
                <ExternalIcon />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="wrap contact-inner">
        <div className="contact-copy">
          <p className="sec-index">04 / Uplink</p>
          <h2>
            Let’s make
            <br />
            something <em>loud</em>
          </h2>
          <p className="contact-note">
            Open to senior frontend and mobile roles. Based in Chicago and available across US time
            zones.
          </p>

          <div className="contact-actions">
            <div className="contact-item">
              <div>
                <span className="contact-lbl">Email</span>
                <a className="contact-val" href={`mailto:${CONTACT.email}`}>
                  {CONTACT.email}
                </a>
              </div>
              <button
                className="copy"
                type="button"
                data-copy={CONTACT.email}
                aria-label="Copy email address"
              >
                <CopyIcon />
                <CheckIcon />
              </button>
            </div>
            <div className="contact-item">
              <div>
                <span className="contact-lbl">Phone</span>
                <a className="contact-val" href={`tel:${CONTACT.phoneHref}`}>
                  {CONTACT.phone}
                </a>
              </div>
              <button
                className="copy"
                type="button"
                data-copy={CONTACT.phone}
                aria-label="Copy phone number"
              >
                <CopyIcon />
                <CheckIcon />
              </button>
            </div>
          </div>

          <div className="contact-btns">
            <span className="magnetic">
              <a className="btn btn-ink" href={CONTACT.resume} download data-resume>
                Resume (PDF)
              </a>
            </span>
            <a
              className="text-link"
              href={CONTACT.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
              <ExternalIcon />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a
              className="text-link"
              href={CONTACT.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
              <ExternalIcon />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>

        <div className="contact-sticker" aria-hidden="true">
          <ContactSticker />
        </div>
      </div>
    </section>
  );
}

export function ElectricSections() {
  return (
    <main id="main">
      <Hero />
      <Ribbon items={RIBBON_A} tone="acid" />
      <Stats />
      <Ribbon items={RIBBON_B} tone="coral" reverse />
      <Work />
      <Stack />
      <Log />
      <Contact />
    </main>
  );
}
