import { NAV } from "./content";
import { useContent } from "./ContentContext";
import { CloseIcon } from "./ElectricArt";
import { otherEditions } from "@/lib/editions";

export function SkipLink() {
  return (
    <a className="skip" href="#main">
      Skip to content
    </a>
  );
}

export function Curtain() {
  return (
    <div className="curtain" aria-hidden="true">
      <span className="curtain-mark">
        BA<i>—03</i>
      </span>
      <span className="curtain-bars">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}

export function TopBar() {
  return (
    <header className="bar">
      <div className="bar-inner">
        <a className="brand" href="#top" aria-label="Babafemi Adojutelegan, back to top">
          <span className="brand-mark" aria-hidden="true">
            BA
          </span>
          <span className="brand-text">Electric Editorial</span>
        </a>

        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => (
            <a href={`#${item.id}`} data-nav key={item.id}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="bar-side">
          <span className="bar-chip">Open to work</span>
          <button
            className="menu"
            id="menuBtn"
            type="button"
            aria-expanded="false"
            aria-controls="drawer"
            aria-label="Open menu"
          >
            <span className="menu-lines" aria-hidden="true">
              <i />
              <i />
            </span>
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
            <span>{item.label}</span>
            <i>{item.index}</i>
          </a>
        ))}
      </nav>
      <div className="drawer-foot">
        <a className="btn btn-acid" href={CONTACT.resume} download data-resume>
          Resume (PDF)
        </a>
        {otherEditions("/electric").map((e) => (
          <a key={e.href} className="drawer-link" href={e.href}>
            {e.name} edition
          </a>
        ))}
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>© 2026 Babafemi Adojutelegan · Electric Editorial</span>
        <div className="footer-links">
          {otherEditions("/electric").map((e) => (
            <a key={e.href} href={e.href}>
              {e.name} edition
            </a>
          ))}
          <a href="#top">Back to top</a>
        </div>
      </div>
    </footer>
  );
}

export function Dossiers() {
  const { DOSSIERS } = useContent();
  return (
    <>
      {DOSSIERS.map((dossier) => (
        <dialog
          className={`dossier dossier-${dossier.accent}`}
          id={`case-${dossier.id}`}
          aria-labelledby={`${dossier.id}-title`}
          key={dossier.id}
        >
          <div className="dossier-top">
            <div>
              <p className="dossier-kicker">{dossier.kicker}</p>
              <h2 id={`${dossier.id}-title`}>{dossier.title}</h2>
            </div>
            <button className="dossier-close" type="button" data-close aria-label="Close dossier">
              <CloseIcon />
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
              <span>Outcome</span>
              {dossier.outcome}
            </p>
          </div>
        </dialog>
      ))}
    </>
  );
}

export function LiveRegion() {
  return <div className="live" id="liveRegion" role="status" aria-live="polite" />;
}

export function Cursor() {
  return (
    <div className="cursor" id="cursor" aria-hidden="true">
      <span className="cursor-dot" />
      <span className="cursor-ring">
        <span className="cursor-label">View</span>
      </span>
    </div>
  );
}
