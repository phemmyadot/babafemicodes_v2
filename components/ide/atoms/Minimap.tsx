const PATTERN = [
  'accent', '', 'short', '', 'medium', 'accent', '', 'short',
  'medium', '', 'accent', 'medium', 'short', '', 'accent', 'short',
  'medium', '', 'accent', 'short', '', 'medium', '', 'short',
  'accent', '', 'medium', 'short', '', 'accent',
]

export function Minimap() {
  return (
    <div className="minimap">
      {PATTERN.map((variant, i) => (
        <div key={i} className={`minimap-line${variant ? ` ${variant}` : ''}`}/>
      ))}
    </div>
  )
}
