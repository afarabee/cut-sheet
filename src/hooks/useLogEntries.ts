import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { LogEntry, LogEntryInput } from '@/types'

export function useLogEntries(date: string) {
  return useQuery<LogEntry[]>({
    queryKey: ['log-entries', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cut_log_entries')
        .select('*')
        .eq('logged_at', date)
        .order('created_at')
      if (error) throw error
      return (data ?? []) as LogEntry[]
    },
  })
}

export function useAddLogEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entry: LogEntryInput) => {
      const { data, error } = await supabase
        .from('cut_log_entries')
        .insert(entry)
        .select()
        .single()
      if (error) throw error
      return data as LogEntry
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['log-entries', data.logged_at] })
      queryClient.invalidateQueries({ queryKey: ['foods', 'recents'] })
    },
  })
}

export function useUpdateLogEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      serving_qty,
      calories,
      protein_g,
      carbs_g,
      fat_g,
      fiber_g,
      total_sugars_g,
      date,
    }: {
      id: string
      serving_qty: number
      calories: number
      protein_g: number
      carbs_g: number
      fat_g: number
      fiber_g: number
      total_sugars_g: number
      date: string
    }) => {
      const { data, error } = await supabase
        .from('cut_log_entries')
        .update({ serving_qty, calories, protein_g, carbs_g, fat_g, fiber_g, total_sugars_g })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return { entry: data as LogEntry, date }
    },
    onSuccess: ({ date }) => {
      queryClient.invalidateQueries({ queryKey: ['log-entries', date] })
    },
  })
}

export function useDeleteLogEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase
        .from('cut_log_entries')
        .delete()
        .eq('id', id)
      if (error) throw error
      return date
    },
    onSuccess: (date) => {
      queryClient.invalidateQueries({ queryKey: ['log-entries', date] })
    },
  })
}
