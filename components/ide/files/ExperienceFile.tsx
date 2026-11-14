import type { ExperienceItem } from '@/components/ide/types'
import { InlineBadge } from '../atoms/InlineBadge'
import { formatPeriod } from '../config'

interface ExperienceFileProps {
  experience: ExperienceItem[]
  isActive: boolean
}

export function ExperienceFile({ experience, isActive }: ExperienceFileProps) {
  return (
    <div className={`file-section ${isActive ? 'active' : ''}`} id="file-experience">
      <div className="code-block">
        <div className="code-line"><span className="op">{'{'}</span></div>
        <div className="code-line indent-1">
          <span className="lk">&quot;experience&quot;</span><span className="op">: [</span>
        </div>

        {experience.map((item, idx) => (
          <div key={idx}>
            <div className="code-line indent-2"><span className="op">{'{'}</span></div>
            <div className="code-line indent-3">
              <span className="lk">&quot;company&quot;</span><span className="op">: </span>
              <span className="st">&quot;{item.company}&quot;</span><span className="op">,</span>
            </div>
            <div className="code-line indent-3">
              <span className="lk">&quot;role&quot;</span><span className="op">: </span>
              <span className="st">&quot;{item.role}&quot;</span><span className="op">,</span>
            </div>
            <div className="code-line indent-3">
              <span className="lk">&quot;period&quot;</span><span className="op">: </span>
              <span className="st">&quot;{formatPeriod(item)}&quot;</span><span className="op">,</span>
              {item.current && <InlineBadge>Current</InlineBadge>}
            </div>
            <div className="code-line indent-3">
              <span className="lk">&quot;highlights&quot;</span><span className="op">: [</span>
            </div>
            {item.bullets.map((bullet, bi) => (
              <div key={bi} className="code-line indent-4">
                <span className="st">&quot;{bullet}&quot;</span>
                {bi < item.bullets.length - 1 && <span className="op">,</span>}
              </div>
            ))}
            <div className="code-line indent-3"><span className="op">]</span></div>
            <div className="code-line indent-2">
              <span className="op">{'}'}{idx < experience.length - 1 ? ',' : ''}</span>
            </div>
            {idx < experience.length - 1 && <div className="code-line blank"/>}
          </div>
        ))}

        <div className="code-line indent-1"><span className="op">]</span></div>
        <div className="code-line"><span className="op">{'}'}</span></div>
      </div>
    </div>
  )
}
