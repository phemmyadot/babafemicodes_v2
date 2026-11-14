interface IconProps {
  className?: string
}

export function HamburgerIcon({ className }: IconProps) {
  return (
    <svg
      width="18" height="18" viewBox="0 0 18 18"
      fill="none" stroke="currentColor" strokeWidth="1.5"
      className={className}
    >
      <line x1="2" y1="5"  x2="16" y2="5"/>
      <line x1="2" y1="9"  x2="16" y2="9"/>
      <line x1="2" y1="13" x2="16" y2="13"/>
    </svg>
  )
}

export function ExplorerIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      className={className}
    >
      <path d="M3 7a2 2 0 012-2h5.586a1 1 0 01.707.293l1.414 1.414A1 1 0 0013.414 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      className={className}
    >
      <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"/>
    </svg>
  )
}

export function SourceControlIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      className={className}
    >
      <path d="M8 6a2 2 0 100-4 2 2 0 000 4zM8 18a2 2 0 100 4 2 2 0 000-4zM8 6v12M16 6a2 2 0 100-4 2 2 0 000 4z"/>
      <circle cx="16" cy="12" r="2"/>
    </svg>
  )
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5"
      className={className}
    >
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

export function ChevronIcon({ open, className }: IconProps & { open: boolean }) {
  return (
    <svg
      viewBox="0 0 10 10" fill="currentColor"
      className={`chevron${open ? ' open' : ''}${className ? ` ${className}` : ''}`}
    >
      <path d="M3 2l4 3-4 3z"/>
    </svg>
  )
}
