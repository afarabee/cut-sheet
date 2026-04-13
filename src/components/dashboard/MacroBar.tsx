import { Progress } from '@/components/ui/progress'

interface MacroBarProps {
  label: string
  current: number
  target: number | null
  unit?: string
  color: string
}

export function MacroBar({ label, current, target, unit = 'g', color }: MacroBarProps) {
  const safeTarget = target ?? 0
  const percentage = safeTarget > 0 ? (current / safeTarget) * 100 : 0
  const rounded = Math.round(current * 10) / 10

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          <span style={{ color }} className="font-semibold">
            {rounded}
          </span>
          {safeTarget > 0 && (
            <> / {safeTarget}{unit}</>
          )}
        </span>
      </div>
      <Progress
        value={Math.min(percentage, 100)}
        max={100}
        indicatorColor={color}
      />
    </div>
  )
}
