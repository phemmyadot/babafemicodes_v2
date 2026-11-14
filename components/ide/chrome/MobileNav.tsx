import { FILE_CONFIG, MOBILE_NAV_IDS, type FileId } from '../config'

interface MobileNavProps {
  activeFile: FileId
  onFileOpen: (id: FileId) => void
}

export function MobileNav({ activeFile, onFileOpen }: MobileNavProps) {
  return (
    <nav className="mobile-nav">
      {MOBILE_NAV_IDS.map(id => (
        <button
          key={id}
          className={`mobile-nav-item ${activeFile === id ? 'active' : ''}`}
          onClick={() => onFileOpen(id)}
        >
          <span className="mobile-nav-icon">{FILE_CONFIG[id].icon}</span>
          <span className="mobile-nav-label">{FILE_CONFIG[id].name.split('.')[0].slice(0, 4)}</span>
        </button>
      ))}
    </nav>
  )
}
