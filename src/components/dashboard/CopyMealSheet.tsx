import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MealTypeSelector } from '@/components/log/MealTypeSelector'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { LogEntry, MealType } from '@/types'

interface CopyMealSheetProps {
  entries: LogEntry[]
  mealType: MealType
  onDone: () => void
  onCancel: () => void
}

export function CopyMealSheet({ entries, mealType, onDone, onCancel }: CopyMealSheetProps) {
  const [targetMeal, setTargetMeal] = useState<MealType>(mealType)
  const [isPending, setIsPending] = useState(false)
  const queryClient = useQueryClient()

  const today = new Date().toISOString().split('T')[0]
  const totalCals = entries.reduce((s, e) => s + (e.calories ?? 0), 0)

  const handleCopy = async () => {
    setIsPending(true)
    try {
      const newEntries = entries.map((e) => ({
        food_id: e.food_id,
        food_name: e.food_name,
        serving_qty: e.serving_qty,
        serving_size: e.serving_size,
        serving_unit: e.serving_unit,
        calories: e.calories,
        protein_g: e.protein_g,
        carbs_g: e.carbs_g,
        fat_g: e.fat_g,
        fiber_g: e.fiber_g,
        total_sugars_g: e.total_sugars_g,
        meal_type: targetMeal,
        entry_method: 'manual',
        logged_at: today,
      }))

      const { error } = await supabase
        .from('cut_log_entries')
        .insert(newEntries)
      if (error) throw error

      queryClient.invalidateQueries({ queryKey: ['log-entries', today] })
      toast.success(`Copied ${entries.length} items to today's ${targetMeal}`)
      onDone()
    } catch {
      toast.error('Failed to copy meal')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

        <h3 className="text-lg font-semibold text-foreground">Copy Meal to Today</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {entries.length} items · {Math.round(totalCals)} cal
        </p>

        <div className="mt-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Copy as</p>
          <MealTypeSelector value={targetMeal} onChange={setTargetMeal} />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          {entries.map((e) => (
            <div key={e.id} className="flex justify-between rounded px-2 py-1.5 text-sm">
              <span className="truncate text-foreground">{e.food_name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {e.calories ?? 0} cal
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={handleCopy}
            disabled={isPending}
            className="h-12 w-full text-base font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            {isPending ? 'Copying...' : 'Copy to Today'}
          </Button>
          <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
