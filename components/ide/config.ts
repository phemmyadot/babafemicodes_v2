import type { ExperienceItem } from '@/components/ide/types'

// ── File registry ────────────────────────────────────────────────
export const FILE_CONFIG = {
  readme:     { name: 'README.md',       icon: '📄', lang: 'Markdown' },
  experience: { name: 'experience.json', icon: '📋', lang: 'JSON' },
  skills:     { name: 'skills.ts',       icon: '⚡', lang: 'TypeScript' },
  projects:   { name: 'projects.tsx',    icon: '🚀', lang: 'TypeScript React' },
  blog:       { name: 'blog.yml',        icon: '✍️', lang: 'YAML' },
  contact:    { name: 'contact.py',      icon: '📬', lang: 'Python' },
} as const

export type FileId = keyof typeof FILE_CONFIG

export const FILE_IDS = Object.keys(FILE_CONFIG) as FileId[]

export const MOBILE_NAV_IDS: FileId[] = [
  'readme', 'experience', 'skills', 'projects', 'blog', 'contact',
]

// ── Date helpers ─────────────────────────────────────────────────
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [year, month] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function formatPeriod(item: ExperienceItem): string {
  const start = formatDate(item.startDate)
  const end = item.current
    ? 'Present'
    : item.endDate
    ? formatDate(item.endDate)
    : 'Present'
  return `${start} — ${end}`
}

export function formatBlogDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
