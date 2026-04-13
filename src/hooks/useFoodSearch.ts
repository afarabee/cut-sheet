import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { searchUSDA, type USDASearchResult } from '@/lib/usda'
import { useDebounce } from './useDebounce'
import type { Food } from '@/types'

export function useFoodSearch(query: string) {
  const debouncedQuery = useDebounce(query.trim(), 300)
  const hasQuery = debouncedQuery.length >= 2

  const local = useQuery<Food[]>({
    queryKey: ['foods', 'search', debouncedQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cut_foods')
        .select('*')
        .ilike('name', `%${debouncedQuery}%`)
        .order('is_favorite', { ascending: false })
        .order('name')
        .limit(20)
      if (error) throw error
      return data ?? []
    },
    enabled: hasQuery,
    staleTime: 0,
  })

  const usda = useQuery<USDASearchResult[]>({
    queryKey: ['usda', 'search', debouncedQuery],
    queryFn: () => searchUSDA(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
    staleTime: 1000 * 60 * 5,
  })

  return {
    localResults: local.data ?? [],
    usdaResults: usda.data ?? [],
    isLoading: hasQuery && (local.isFetching || usda.isFetching),
    isSearching: hasQuery,
  }
}

export function useFavorites() {
  return useQuery<Food[]>({
    queryKey: ['foods', 'favorites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cut_foods')
        .select('*')
        .eq('is_favorite', true)
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useRecentFoods() {
  return useQuery<Food[]>({
    queryKey: ['foods', 'recents'],
    queryFn: async () => {
      // Get distinct recent food_ids from log entries, then fetch those foods
      const { data: entries, error: entriesError } = await supabase
        .from('cut_log_entries')
        .select('food_id')
        .not('food_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(50)
      if (entriesError) throw entriesError

      // Deduplicate by food_id, keep first 10
      const seenIds = new Set<string>()
      const uniqueIds: string[] = []
      for (const entry of entries ?? []) {
        if (entry.food_id && !seenIds.has(entry.food_id)) {
          seenIds.add(entry.food_id)
          uniqueIds.push(entry.food_id)
          if (uniqueIds.length >= 10) break
        }
      }

      if (uniqueIds.length === 0) return []

      const { data: foods, error: foodsError } = await supabase
        .from('cut_foods')
        .select('*')
        .in('id', uniqueIds)
      if (foodsError) throw foodsError
      return foods ?? []
    },
  })
}
