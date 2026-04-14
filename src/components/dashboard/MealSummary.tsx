import { useState } from 'react'
import { Bookmark, ChevronDown, Copy, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { MEAL_LABELS, type MealType } from '@/lib/constants'
import { useDeleteLogEntry, useUpdateLogEntry } from '@/hooks/useLogEntries'
import { PortionSheet } from '@/components/log/PortionSheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { CreateTemplateSheet } from '@/components/templates/CreateTemplateSheet'
import { CopyMealSheet } from '@/components/dashboard/CopyMealSheet'
import type { LogEntry, Food } from '@/types'

interface MealSummaryProps {
  mealType: MealType
  entries: LogEntry[]
  date: string
}

export function MealSummary({ mealType, entries, date }: MealSummaryProps) {
  const [expanded, setExpanded] = useState(true)
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<LogEntry | null>(null)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [showCopyMeal, setShowCopyMeal] = useState(false)
  const deleteEntry = useDeleteLogEntry()
  const updateEntry = useUpdateLogEntry()

  if (entries.length === 0) return null

  const totalCals = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0)

  // Build a pseudo-Food from the log entry so PortionSheet can display it
  const entryAsFood = (entry: LogEntry): Food => ({
    id: entry.food_id ?? '',
    name: entry.food_name,
    brand: null,
    serving_size: entry.serving_size,
    serving_unit: entry.serving_unit,
    // Store per-serving macros (divide logged values by original serving qty)
    calories: entry.serving_qty ? Math.round((entry.calories ?? 0) / entry.serving_qty) : entry.calories,
    protein_g: entry.serving_qty ? Math.round(((entry.protein_g ?? 0) / entry.serving_qty) * 10) / 10 : entry.protein_g,
    carbs_g: entry.serving_qty ? Math.round(((entry.carbs_g ?? 0) / entry.serving_qty) * 10) / 10 : entry.carbs_g,
    fat_g: entry.serving_qty ? Math.round(((entry.fat_g ?? 0) / entry.serving_qty) * 10) / 10 : entry.fat_g,
    fiber_g: entry.serving_qty ? Math.round(((entry.fiber_g ?? 0) / entry.serving_qty) * 10) / 10 : entry.fiber_g,
    total_sugars_g: entry.serving_qty ? Math.round(((entry.total_sugars_g ?? 0) / entry.serving_qty) * 10) / 10 : entry.total_sugars_g,
    source: 'custom',
    usda_fdc_id: null,
    barcode: null,
    is_favorite: false,
    created_at: '',
  })

  const handleUpdate = (servings: number) => {
    if (!editingEntry) return
    const food = entryAsFood(editingEntry)

    updateEntry.mutate(
      {
        id: editingEntry.id,
        serving_qty: servings,
        calories: Math.round((food.calories ?? 0) * servings),
        protein_g: Math.round((food.protein_g ?? 0) * servings * 10) / 10,
        carbs_g: Math.round((food.carbs_g ?? 0) * servings * 10) / 10,
        fat_g: Math.round((food.fat_g ?? 0) * servings * 10) / 10,
        fiber_g: Math.round((food.fiber_g ?? 0) * servings * 10) / 10,
        total_sugars_g: Math.round((food.total_sugars_g ?? 0) * servings * 10) / 10,
        date,
      },
      {
        onSuccess: () => {
          toast.success('Entry updated')
          setEditingEntry(null)
        },
        onError: () => {
          toast.error('Failed to update entry')
        },
      }
    )
  }

  const handleConfirmDelete = () => {
    if (!deletingEntry) return
    deleteEntry.mutate(
      { id: deletingEntry.id, date },
      {
        onSuccess: () => {
          toast.success('Entry removed')
          setDeletingEntry(null)
        },
      }
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between p-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex flex-1 items-center gap-2"
          >
            <span className="font-medium text-foreground">
              {MEAL_LABELS[mealType]}
            </span>
            <span className="text-xs text-muted-foreground">
              {entries.length} item{entries.length !== 1 ? 's' : ''}
            </span>
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowSaveTemplate(true)}
              title="Save as template"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Bookmark className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowCopyMeal(true)}
              title="Copy meal to today"
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <span className="ml-1 text-sm font-semibold text-primary">
              {Math.round(totalCals)} cal
            </span>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-muted-foreground transition-transform',
                  expanded && 'rotate-180'
                )}
              />
            </button>
          </div>
        </div>

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
                    <span>F{entry.fat_g ?? 0}</span>
                    <span>C{entry.carbs_g ?? 0}</span>
                    <span>P{entry.protein_g ?? 0}</span>
                  </div>
                </div>
                <div className="ml-2 flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setEditingEntry(entry)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingEntry(entry)}
                    className="rounded p-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingEntry && (
        <PortionSheet
          food={entryAsFood(editingEntry)}
          initialServings={editingEntry.serving_qty ?? 1}
          onConfirm={handleUpdate}
          onCancel={() => setEditingEntry(null)}
          isPending={updateEntry.isPending}
          confirmLabel="Save Changes"
        />
      )}

      {deletingEntry && (
        <ConfirmDialog
          title="Delete entry?"
          message={`Remove "${deletingEntry.food_name}" from this meal?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingEntry(null)}
          isPending={deleteEntry.isPending}
        />
      )}

      {showSaveTemplate && (
        <CreateTemplateSheet
          prefillName={MEAL_LABELS[mealType]}
          prefillItems={entries
            .filter((e) => e.food_id)
            .map((e) => ({
              food: entryAsFood(e),
              servingQty: e.serving_qty ?? 1,
            }))}
          onDone={() => setShowSaveTemplate(false)}
          onCancel={() => setShowSaveTemplate(false)}
        />
      )}

      {showCopyMeal && (
        <CopyMealSheet
          entries={entries}
          mealType={mealType}
          onDone={() => setShowCopyMeal(false)}
          onCancel={() => setShowCopyMeal(false)}
        />
      )}
    </>
  )
}
