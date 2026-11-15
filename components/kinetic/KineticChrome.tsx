import { NAV } from "./content";
import { useContent } from "./ContentContext";
import { Close, Download, Menu } from "./icons";

export function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a
          className="brand"
          href="#mission"
          aria-label="BA / Kinetic — Babafemi Adojutelegan, back to top"
        >
          <span className="brand-sigil" aria-hidden="true">
            ◈
          </span>
          <span>
            BA <span className="brand-dim">/ Kinetic</span>
          </span>
        </a>

        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => (
            <a href={`#${item.id}`} data-nav key={item.id}>
              <span className="idx">{item.index}</span> {item.label}
            </a>
          ))}
        </nav>

        <div className="topbar-actions">
          <span className="sys">
            <i aria-hidden="true" /> SYS Online
          </span>
          <button
            className="menu-btn"
            type="button"
            id="menuBtn"
            aria-expanded="false"
            aria-controls="drawer"
            aria-label="Open menu"
          >
            <Menu size={20} className="icon-menu" />
            <Close size={20} className="icon-close" />
          </button>
        </div>
        <div className="progress" aria-hidden="true">
          <span id="progressBar" />
        </div>
      </div>
    </header>
  );
}

export function Drawer() {
  const { CONTACT } = useContent();
  return (
    <div className="drawer" id="drawer" hidden>
      <nav aria-label="Mobile">
        {NAV.map((item) => (
          <a href={`#${item.id}`} data-drawer-link key={item.id}>
            {item.label} <span className="mono">{item.index}</span>
          </a>
        ))}
      </nav>
      <div className="drawer-foot">
        <a className="btn btn-primary" href={CONTACT.resume} download data-resume>
          <Download />
          Download Audited Resume (PDF)
        </a>
      </div>
    </div>
  );
}

export function Frame() {
  return (
    <div className="frame" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

export function HudReadout() {
  return (
    <div className="hud-readout" aria-hidden="true">
      <span>CHI_IL · 41.88N / 87.63W</span>
      <span>
        LOCAL <b id="clock">00:00:00</b>
      </span>
    </div>
  );
}

export function HudScroll() {
  return (
    <div className="hud-scroll" aria-hidden="true">
      Scroll to explore <i />
    </div>
  );
}

export function LiveRegion() {
  return <div className="live-region" id="liveRegion" role="status" aria-live="polite" />;
}

export function Cursors() {
  return (
    <>
      <div className="cursor-dot" id="cursorDot" aria-hidden="true" />
      <div className="cursor-ring" id="cursorRing" aria-hidden="true" />
    </>
  );
}

export function Dossiers() {
  const { DOSSIERS } = useContent();
  return (
    <>
      {DOSSIERS.map((dossier) => (
        <dialog
          className="dossier"
          id={`case-${dossier.id}`}
          aria-labelledby={`${dossier.id}-title`}
          key={dossier.id}
        >
          <div className="dossier-head">
            <div>
              <p className="kicker">{dossier.kicker}</p>
              <h2 id={`${dossier.id}-title`}>{dossier.title}</h2>
            </div>
            <button className="icon-btn" type="button" data-close aria-label="Close dossier">
              <Close size={18} />
            </button>
          </div>
          <div className="dossier-body">
            <dl className="meta-grid">
              {dossier.meta.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
            <h3>What I built</h3>
            <ul className="detail-list">
              {dossier.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p className="outcome">
              <span className="mono">Outcome</span>
              {dossier.outcome}
            </p>
          </div>
        </dialog>
      ))}
    </>
  );
}
