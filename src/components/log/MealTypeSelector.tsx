import { cn } from '@/lib/utils'
import { MEAL_TYPES, MEAL_LABELS, type MealType } from '@/lib/constants'

interface MealTypeSelectorProps {
  value: MealType
  onChange: (value: MealType) => void
}

export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {MEAL_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all',
            value === type
              ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          )}
        >
          {MEAL_LABELS[type]}
        </button>
      ))}
    </div>
  )
}
