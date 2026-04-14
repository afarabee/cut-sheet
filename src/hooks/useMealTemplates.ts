import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { MealTemplate, MealTemplateItem, LogEntryInput, MealType } from '@/types'

interface CreateTemplateInput {
  name: string
  items: {
    food_id: string
    food_name: string
    serving_qty: number
    serving_size: number | null
    serving_unit: string | null
    calories: number | null
    protein_g: number | null
    carbs_g: number | null
    fat_g: number | null
    fiber_g: number | null
    total_sugars_g: number | null
  }[]
}

export function useMealTemplates() {
  return useQuery<MealTemplate[]>({
    queryKey: ['meal-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cut_meal_templates')
        .select('*, items:cut_meal_template_items(*)')
        .order('name')
      if (error) throw error
      return (data ?? []) as MealTemplate[]
    },
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTemplateInput) => {
      // Insert template
      const { data: template, error: tErr } = await supabase
        .from('cut_meal_templates')
        .insert({ name: input.name })
        .select()
        .single()
      if (tErr) throw tErr

      // Insert items
      const items = input.items.map((item, i) => ({
        template_id: template.id,
        food_id: item.food_id,
        food_name: item.food_name,
        serving_qty: item.serving_qty,
        serving_size: item.serving_size,
        serving_unit: item.serving_unit,
        calories: item.calories,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        fiber_g: item.fiber_g,
        total_sugars_g: item.total_sugars_g,
        sort_order: i,
      }))

      const { error: iErr } = await supabase
        .from('cut_meal_template_items')
        .insert(items)
      if (iErr) throw iErr

      return template as MealTemplate
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-templates'] })
    },
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cut_meal_templates')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-templates'] })
    },
  })
}

export function useLogTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      items,
      mealType,
      date,
    }: {
      items: MealTemplateItem[]
      mealType: MealType
      date: string
    }) => {
      const entries: LogEntryInput[] = items.map((item) => ({
        food_id: item.food_id,
        food_name: item.food_name,
        serving_qty: item.serving_qty,
        serving_size: item.serving_size,
        serving_unit: item.serving_unit,
        calories: item.calories ? Math.round(item.calories * (item.serving_qty ?? 1)) : null,
        protein_g: item.protein_g ? Math.round(item.protein_g * (item.serving_qty ?? 1) * 10) / 10 : null,
        carbs_g: item.carbs_g ? Math.round(item.carbs_g * (item.serving_qty ?? 1) * 10) / 10 : null,
        fat_g: item.fat_g ? Math.round(item.fat_g * (item.serving_qty ?? 1) * 10) / 10 : null,
        fiber_g: item.fiber_g ? Math.round(item.fiber_g * (item.serving_qty ?? 1) * 10) / 10 : null,
        total_sugars_g: item.total_sugars_g ? Math.round(item.total_sugars_g * (item.serving_qty ?? 1) * 10) / 10 : null,
        meal_type: mealType,
        entry_method: 'manual',
        logged_at: date,
      }))

      const { error } = await supabase
        .from('cut_log_entries')
        .insert(entries)
      if (error) throw error

      return date
    },
    onSuccess: (date) => {
      queryClient.invalidateQueries({ queryKey: ['log-entries', date] })
      queryClient.invalidateQueries({ queryKey: ['foods', 'recents'] })
    },
  })
}
