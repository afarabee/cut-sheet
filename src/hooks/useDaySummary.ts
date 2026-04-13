import { useMemo } from 'react'
import { useLogEntries } from './useLogEntries'
import { useDailyTargets } from './useDailyTargets'
import type { MacroTotals, LogEntry, MealType } from '@/types'

export function useDaySummary(date: string) {
  const { data: entries, isLoading: entriesLoading } = useLogEntries(date)
  const { data: targets, isLoading: targetsLoading } = useDailyTargets(date)

  const totals = useMemo<MacroTotals>(() => {
    if (!entries?.length) {
      return { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, total_sugars_g: 0 }
    }
    return entries.reduce(
      (acc, entry) => ({
        calories: acc.calories + (entry.calories ?? 0),
        protein_g: acc.protein_g + (entry.protein_g ?? 0),
        carbs_g: acc.carbs_g + (entry.carbs_g ?? 0),
        fat_g: acc.fat_g + (entry.fat_g ?? 0),
        fiber_g: acc.fiber_g + (entry.fiber_g ?? 0),
        total_sugars_g: acc.total_sugars_g + (entry.total_sugars_g ?? 0),
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, total_sugars_g: 0 }
    )
  }, [entries])

  const mealGroups = useMemo(() => {
    const groups: Record<MealType, LogEntry[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }
    entries?.forEach((entry) => {
      const type = entry.meal_type as MealType
      if (groups[type]) {
        groups[type].push(entry)
      }
    })
    return groups
  }, [entries])

  return {
    entries: entries ?? [],
    totals,
    targets,
    mealGroups,
    isLoading: entriesLoading || targetsLoading,
  }
}
