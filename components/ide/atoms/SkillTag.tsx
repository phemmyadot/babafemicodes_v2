interface SkillTagProps {
  label: string
}

export function SkillTag({ label }: SkillTagProps) {
  return <span className="skill-tag">{label}</span>
}
