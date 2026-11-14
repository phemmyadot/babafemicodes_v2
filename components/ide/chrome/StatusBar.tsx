import { otherEditions } from "@/lib/editions"

interface StatusBarProps {
  fileName: string
  lang: string
}

export function StatusBar({ fileName, lang }: StatusBarProps) {
  return (
    <div className="statusbar">
      <div className="statusbar-left">
        <div className="status-item">
          <span className="status-icon">⎇</span>
          <span>main</span>
        </div>
        <div className="status-item status-hide-sm">
          <span className="status-icon">✓</span>
          <span>0 errors, 0 warnings</span>
        </div>
        <nav className="status-editions" aria-label="Other editions">
          {otherEditions("/ide").map((e) => (
            <a key={e.href} className="status-item" href={e.href}>
              {e.name} edition
            </a>
          ))}
        </nav>
      </div>
      <div className="statusbar-right">
        <div className="status-item">{fileName}</div>
        <div className="status-item status-hide-sm">Ln 1, Col 1</div>
        <div className="status-item status-hide-sm">UTF-8</div>
        <div className="status-item">{lang}</div>
        <div className="status-item status-hide-sm">Prettier</div>
      </div>
    </div>
  )
}
