import type { MealTemplate } from '@/types'

interface TemplateCardProps {
  template: MealTemplate
  onUse: () => void
}

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const items = template.items ?? []
  const totalCals = items.reduce((sum, i) => sum + ((i.calories ?? 0) * (i.serving_qty ?? 1)), 0)
  const totalProtein = items.reduce((sum, i) => sum + ((i.protein_g ?? 0) * (i.serving_qty ?? 1)), 0)
  const totalCarbs = items.reduce((sum, i) => sum + ((i.carbs_g ?? 0) * (i.serving_qty ?? 1)), 0)
  const totalFat = items.reduce((sum, i) => sum + ((i.fat_g ?? 0) * (i.serving_qty ?? 1)), 0)

  return (
    <button
      type="button"
      onClick={onUse}
      className="flex w-full flex-col gap-1.5 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{template.name}</span>
        <span className="text-xs text-muted-foreground">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex gap-3 text-xs text-muted-foreground">
        <span>{Math.round(totalCals)} cal</span>
        <span className="text-neon-pink">F {Math.round(totalFat)}g</span>
        <span className="text-neon-purple">C {Math.round(totalCarbs)}g</span>
        <span className="text-neon-green">P {Math.round(totalProtein)}g</span>
      </div>
      <div className="text-xs text-muted-foreground/60">
        {items.map((i) => i.food_name).join(', ')}
      </div>
    </button>
  )
}
