import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MealTypeSelector } from '@/components/log/MealTypeSelector'
import { useLogTemplate } from '@/hooks/useMealTemplates'
import { getDefaultMealType, type MealType } from '@/lib/constants'
import type { MealTemplate } from '@/types'

interface UseTemplateSheetProps {
  template: MealTemplate
  onDone: () => void
  onCancel: () => void
}

export function UseTemplateSheet({ template, onDone, onCancel }: UseTemplateSheetProps) {
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType())
  const logTemplate = useLogTemplate()
  const items = template.items ?? []
  const today = new Date().toISOString().split('T')[0]

  const totalCals = items.reduce((s, i) => s + ((i.calories ?? 0) * (i.serving_qty ?? 1)), 0)

  const handleLog = () => {
    logTemplate.mutate(
      { items, mealType, date: today },
      {
        onSuccess: () => {
          toast.success(`${template.name} logged (${items.length} items)`)
          onDone()
        },
        onError: () => toast.error('Failed to log template'),
      }
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

        <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {items.length} items · {Math.round(totalCals)} cal
        </p>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Log as</p>
          <MealTypeSelector value={mealType} onChange={setMealType} />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between rounded px-2 py-1.5 text-sm">
              <span className="truncate text-foreground">{item.food_name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.serving_qty ?? 1}x · {Math.round((item.calories ?? 0) * (item.serving_qty ?? 1))} cal
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={handleLog}
            disabled={logTemplate.isPending}
            className="h-12 w-full text-base font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            {logTemplate.isPending ? 'Logging...' : 'Log All'}
          </Button>
          <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
