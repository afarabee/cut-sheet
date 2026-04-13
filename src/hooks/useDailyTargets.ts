import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { DailyTargets, DailyTargetsInput } from '@/types'

export function useDailyTargets(date?: string) {
  const targetDate = date || new Date().toISOString().split('T')[0]

  return useQuery<DailyTargets | null>({
    queryKey: ['daily-targets', targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cut_daily_targets')
        .select('*')
        .lte('effective_date', targetDate)
        .order('effective_date', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useSaveTargets() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DailyTargetsInput) => {
      const { data, error } = await supabase
        .from('cut_daily_targets')
        .upsert(input, { onConflict: 'effective_date' })
        .select()
        .single()
      if (error) throw error
      return data as DailyTargets
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-targets'] })
    },
  })
}
