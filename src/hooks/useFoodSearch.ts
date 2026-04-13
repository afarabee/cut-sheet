import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { searchUSDA, type USDASearchResult } from '@/lib/usda'
import { useDebounce } from './useDebounce'
import type { Food } from '@/types'

export function useFoodSearch(query: string) {
  const debouncedQuery = useDebounce(query.trim(), 300)

  const local = useQuery<Food[]>({
    queryKey: ['foods', 'search', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length < 2) return []
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
    enabled: debouncedQuery.length >= 2,
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
    isLoading: local.isLoading || usda.isLoading,
    isSearching: debouncedQuery.length >= 2,
  }
}
