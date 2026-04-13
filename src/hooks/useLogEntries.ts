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
      console.log('[Cut Sheet] Inserting log entry:', entry)
      const { data, error } = await supabase
        .from('cut_log_entries')
        .insert(entry)
        .select()
        .single()
      if (error) {
        console.error('[Cut Sheet] Insert error:', error)
        throw error
      }
      console.log('[Cut Sheet] Insert success:', data)
      return data as LogEntry
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['log-entries', data.logged_at] })
      queryClient.invalidateQueries({ queryKey: ['foods', 'recents'] })
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
