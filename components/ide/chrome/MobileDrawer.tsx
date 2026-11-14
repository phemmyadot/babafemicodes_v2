import { otherEditions } from "@/lib/editions"
import { SITE_DOMAIN } from "@/lib/site"
import { FILE_CONFIG, FILE_IDS, type FileId } from '../config'
import { ChevronIcon } from '../icons/Icons'

interface MobileDrawerProps {
  open: boolean
  activeFile: FileId
  resumeUrl: string
  onFileOpen: (id: FileId) => void
  onClose: () => void
}

export function MobileDrawer({ open, activeFile, resumeUrl, onFileOpen, onClose }: MobileDrawerProps) {
  return (
    <>
      <div className={`drawer-backdrop ${open ? 'open' : ''}`} onClick={onClose}/>

      <div className={`sidebar-drawer ${open ? 'open' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Explorer</span>
          <span
            onClick={onClose}
            style={{ cursor: 'pointer', padding: '4px 8px', fontSize: 16, color: 'var(--text-muted)' }}
          >✕</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <ChevronIcon open />
            {SITE_DOMAIN.toUpperCase()}
          </div>
          {FILE_IDS.map(id => (
            <div
              key={id}
              className={`sidebar-item ${activeFile === id ? 'active' : ''}`}
              onClick={() => onFileOpen(id)}
            >
              <span className="file-icon">{FILE_CONFIG[id].icon}</span>
              <span className="file-name">{FILE_CONFIG[id].name}</span>
            </div>
          ))}
        </div>

        {resumeUrl && (
          <div className="sidebar-section">
            <div className="sidebar-section-header">
              <ChevronIcon open />
              ASSETS
            </div>
            <div className="sidebar-item" onClick={() => window.open(resumeUrl, '_blank')}>
              <span className="file-icon">📎</span>
              <span className="file-name">resume.pdf</span>
            </div>
          </div>
        )}

        <div className="sidebar-section">
          <div className="sidebar-section-header">
            <ChevronIcon open />
            EDITIONS
          </div>
          {otherEditions('/ide').map(e => (
            <a key={e.href} className="sidebar-item" href={e.href}>
              <span className="file-icon">↗</span>
              <span className="file-name">{e.name} edition</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
