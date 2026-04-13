import { useState } from 'react'
import { ChevronDown, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { MEAL_LABELS, type MealType } from '@/lib/constants'
import { useDeleteLogEntry } from '@/hooks/useLogEntries'
import type { LogEntry } from '@/types'

interface MealSummaryProps {
  mealType: MealType
  entries: LogEntry[]
  date: string
}

export function MealSummary({ mealType, entries, date }: MealSummaryProps) {
  const [expanded, setExpanded] = useState(true)
  const deleteEntry = useDeleteLogEntry()

  if (entries.length === 0) return null

  const totalCals = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0)

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">
            {MEAL_LABELS[mealType]}
          </span>
          <span className="text-xs text-muted-foreground">
            {entries.length} item{entries.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">
            {Math.round(totalCals)} cal
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="group flex items-center justify-between px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{entry.food_name}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {entry.serving_qty && (
                    <span>
                      {entry.serving_qty}x {entry.serving_size}{entry.serving_unit}
                    </span>
                  )}
                  <span>{entry.calories ?? 0} cal</span>
                  <span>P{entry.protein_g ?? 0}</span>
                  <span>C{entry.carbs_g ?? 0}</span>
                  <span>F{entry.fat_g ?? 0}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  deleteEntry.mutate(
                    { id: entry.id, date },
                    {
                      onSuccess: () => toast.success('Entry removed'),
                    }
                  )
                }
                className="ml-2 hidden shrink-0 rounded p-1 text-destructive hover:bg-destructive/10 group-hover:block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
