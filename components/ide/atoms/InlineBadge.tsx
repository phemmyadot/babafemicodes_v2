interface InlineBadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'green' | 'orange'
}

export function InlineBadge({ children, variant = 'default' }: InlineBadgeProps) {
  const cls = variant === 'default' ? 'inline-badge' : `inline-badge ${variant}`
  return <span className={cls}>{children}</span>
}
