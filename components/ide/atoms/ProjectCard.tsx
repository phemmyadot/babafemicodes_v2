import type { Project } from '@/components/ide/types'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="project-card">
      <div className="project-title">{project.title}</div>
      <div className="project-extras">
        <span className="project-extra">{project.categoryLabel}</span>
        {project.extras?.map((extra, i) => (
          <span key={i} className="project-extra">{extra}</span>
        ))}
      </div>
      <div className="project-desc">{project.description}</div>
      <div className="project-tags">
        {project.tags?.map((tag, i) => (
          <span key={i} className="project-tag">{tag}</span>
        ))}
      </div>
      <div className="project-links">
        {project.repository && (
          <a className="project-link" href={project.repository} target="_blank" rel="noopener noreferrer">
            ⎇ GitHub
          </a>
        )}
        {project.liveUrls?.map((item) => (
          <a key={item.link} className="project-link" href={item.link} target="_blank" rel="noopener noreferrer">
            ↗ {item.title}
          </a>
        ))}
      </div>
    </div>
  )
}
