import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Food, FoodInput } from '@/types'

export function useFoods(searchQuery?: string) {
  return useQuery<Food[]>({
    queryKey: ['foods', searchQuery ?? ''],
    queryFn: async () => {
      let query = supabase
        .from('cut_foods')
        .select('*')
        .order('name')

      if (searchQuery && searchQuery.trim().length >= 2) {
        query = query.ilike('name', `%${searchQuery.trim()}%`)
      }

      const { data, error } = await query.limit(50)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateFood() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: FoodInput) => {
      const { data, error } = await supabase
        .from('cut_foods')
        .insert(input)
        .select()
        .single()
      if (error) throw error
      return data as Food
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}

export function useUpdateFood() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: FoodInput & { id: string }) => {
      const { data, error } = await supabase
        .from('cut_foods')
        .update(input)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Food
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}

export function useDeleteFood() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cut_foods')
        .delete()
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const { error } = await supabase
        .from('cut_foods')
        .update({ is_favorite })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}
