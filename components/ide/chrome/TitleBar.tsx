import { SITE_DOMAIN } from "@/lib/site"
import { HamburgerIcon } from '../icons/Icons'

interface TitleBarProps {
  onHamburger: () => void
}

export function TitleBar({ onHamburger }: TitleBarProps) {
  return (
    <div className="titlebar">
      <button className="titlebar-hamburger" onClick={onHamburger} aria-label="Toggle file explorer">
        <HamburgerIcon />
      </button>
      <div className="titlebar-dots">
        <div className="dot red"/>
        <div className="dot yellow"/>
        <div className="dot green"/>
      </div>
      <div className="titlebar-menu">
        {['File', 'Edit', 'View', 'Terminal', 'Help'].map(m => (
          <div key={m} className="menu-item">{m}</div>
        ))}
      </div>
      <div className="titlebar-title">{SITE_DOMAIN} — Visual Studio Code</div>
    </div>
  )
}
