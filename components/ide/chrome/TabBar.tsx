import { FILE_CONFIG, type FileId } from '../config'

interface TabBarProps {
  openTabs: FileId[]
  activeFile: FileId
  onFileOpen: (id: FileId) => void
  onCloseTab: (e: React.MouseEvent, id: FileId) => void
}

export function TabBar({ openTabs, activeFile, onFileOpen, onCloseTab }: TabBarProps) {
  return (
    <div className="tabs">
      {openTabs.map(id => (
        <div
          key={id}
          className={`tab ${id === activeFile ? 'active' : ''}`}
          onClick={() => onFileOpen(id)}
        >
          <span className="tab-icon">{FILE_CONFIG[id].icon}</span>
          {FILE_CONFIG[id].name}
          <span className="tab-close" onClick={e => onCloseTab(e, id)}>×</span>
        </div>
      ))}
    </div>
  )
}
