interface MacroRingProps {
  current: number
  target: number | null
}

export function MacroRing({ current, target }: MacroRingProps) {
  const safeTarget = target ?? 2000
  const percentage = safeTarget > 0 ? Math.min((current / safeTarget) * 100, 100) : 0
  const remaining = Math.max(safeTarget - current, 0)

  // SVG ring
  const radius = 70
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  // Color based on progress
  let color = 'var(--neon-cyan)'
  if (target && current >= target * 0.95 && current <= target * 1.05) {
    color = 'var(--neon-green)'
  } else if (target && current > target) {
    color = 'var(--neon-pink)'
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg width="180" height="180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={stroke}
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold text-foreground">
          {Math.round(current)}
        </span>
        <span className="text-xs text-muted-foreground">
          / {safeTarget} cal
        </span>
        <span className="mt-1 text-xs font-medium" style={{ color }}>
          {remaining > 0 ? `${Math.round(remaining)} left` : 'Target hit'}
        </span>
      </div>
    </div>
  )
}
