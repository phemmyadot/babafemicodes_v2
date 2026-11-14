import type { Project } from '@/components/ide/types'
import { ProjectCard } from '../atoms/ProjectCard'

interface ProjectsFileProps {
  projects: Project[]
  isActive: boolean
}

export function ProjectsFile({ projects, isActive }: ProjectsFileProps) {
  return (
    <div className={`file-section ${isActive ? 'active' : ''}`} id="file-projects">
      <div className="code-block">
        <div className="code-line">
          <span className="kw">import</span><span className="op"> {'{ '}</span>
          <span className="ty">FC</span>
          <span className="op">{' }'} </span>
          <span className="kw">from </span>
          <span className="st">&apos;react&apos;</span><span className="op">;</span>
        </div>
        <div className="code-line blank"/>
        <div className="code-line"><span className="cm">{'// Things I\'ve built and shipped'}</span></div>
        <div className="code-line blank"/>
        <div className="code-line">
          <span className="kw">const </span><span className="fn">Projects</span>
          <span className="op">: </span><span className="ty">FC</span>
          <span className="op"> = () =&gt; (</span>
        </div>
        <div className="code-line indent-1">
          <span className="op">&lt;</span><span className="ty">section</span><span className="op">&gt;</span>
        </div>
      </div>

      {projects.map((project, i) => (
        <ProjectCard key={i} project={project}/>
      ))}

      <div className="code-block">
        <div className="code-line indent-1">
          <span className="op">&lt;/</span><span className="ty">section</span><span className="op">&gt;</span>
        </div>
        <div className="code-line"><span className="op">);</span></div>
        <div className="code-line blank"/>
        <div className="code-line">
          <span className="kw">export default </span><span className="fn">Projects</span><span className="op">;</span>
        </div>
      </div>
    </div>
  )
}
