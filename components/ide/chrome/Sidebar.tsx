import { SITE_DOMAIN } from "@/lib/site"
import { FILE_CONFIG, FILE_IDS, type FileId } from '../config'
import { ChevronIcon } from '../icons/Icons'

interface SidebarProps {
  activeFile: FileId
  resumeUrl: string
  portfolioExpanded: boolean
  assetsExpanded: boolean
  onFileOpen: (id: FileId) => void
  onTogglePortfolio: () => void
  onToggleAssets: () => void
}

export function Sidebar({
  activeFile,
  resumeUrl,
  portfolioExpanded,
  assetsExpanded,
  onFileOpen,
  onTogglePortfolio,
  onToggleAssets,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">Explorer</div>

      <div className="sidebar-section">
        <div className="sidebar-section-header" onClick={onTogglePortfolio}>
          <ChevronIcon open={portfolioExpanded} />
          {SITE_DOMAIN.toUpperCase()}
        </div>
        {portfolioExpanded && FILE_IDS.map(id => (
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

      <div className="sidebar-section">
        <div className="sidebar-section-header" onClick={onToggleAssets}>
          <ChevronIcon open={assetsExpanded} />
          ASSETS
        </div>
        {assetsExpanded && (
          <>
            {resumeUrl && (
              <div className="sidebar-item" onClick={() => window.open(resumeUrl, '_blank')}>
                <span className="file-icon">📎</span>
                <span className="file-name">resume.pdf</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
