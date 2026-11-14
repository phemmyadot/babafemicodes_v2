import type { SkillGroup } from '@/components/ide/types'
import { SkillTag } from '../atoms/SkillTag'

interface SkillsFileProps {
  skillGroups: SkillGroup[]
  isActive: boolean
}

export function SkillsFile({ skillGroups, isActive }: SkillsFileProps) {
  return (
    <div className={`file-section ${isActive ? 'active' : ''}`} id="file-skills">
      <div className="code-block">
        <div className="code-line">
          <span className="kw">import type</span><span className="op"> {'{ '}</span>
          <span className="ty">TechStack</span>
          <span className="op">{' }'} </span>
          <span className="kw">from </span>
          <span className="st">&apos;@babafemi/types&apos;</span><span className="op">;</span>
        </div>
        <div className="code-line blank"/>
        <div className="code-line"><span className="cm">/**</span></div>
        <div className="code-line"><span className="cm"> * Babafemi&apos;s complete technology arsenal.</span></div>
        <div className="code-line"><span className="cm"> */</span></div>
        <div className="code-line blank"/>
        <div className="code-line">
          <span className="kw">export const </span>
          <span className="lk">skills</span><span className="op">: </span>
          <span className="ty">TechStack</span><span className="op"> = {'{'}</span>
        </div>

        {skillGroups.map((group, gi) => (
          <div key={gi}>
            <div className="code-line blank"/>
            <div className="code-line indent-1">
              <span className="lk">{group.label.toLowerCase().replace(/\s+/g, '_')}</span>
              <span className="op">: {'{'}</span>
            </div>
            <div className="code-line indent-2">
              <span className="lk">skills</span><span className="op">: [</span>
            </div>
            <div className="code-line indent-2" style={{ paddingTop: 4, paddingBottom: 4 }}>
              {group.skills.map((skill, si) => (
                <SkillTag key={si} label={skill}/>
              ))}
            </div>
            <div className="code-line indent-2"><span className="op">]</span></div>
            <div className="code-line indent-1">
              <span className="op">{'}'}{gi < skillGroups.length - 1 ? ',' : ''}</span>
            </div>
          </div>
        ))}

        <div className="code-line blank"/>
        <div className="code-line"><span className="op">{'};'}</span></div>
        <div className="code-line blank"/>
        <div className="code-line">
          <span className="kw">export default </span>
          <span className="lk">skills</span><span className="op">;</span>
        </div>
      </div>
    </div>
  )
}
