interface LineNumbersProps {
  count: number
}

export function LineNumbers({ count }: LineNumbersProps) {
  return (
    <div className="line-numbers">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ height: '22px', lineHeight: '22px' }}>{i + 1}</div>
      ))}
    </div>
  )
}
