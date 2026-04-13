import type { FoodInput } from '@/types'

const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'

// USDA nutrient IDs
const NUTRIENT_IDS = {
  calories: 1008,
  protein: 1003,
  carbs: 1005,
  fat: 1004,
  fiber: 1079,
  total_sugars: 2000,
} as const

interface USDANutrient {
  nutrientId: number
  value: number
}

interface USDAFood {
  fdcId: number
  description: string
  brandName?: string
  brandOwner?: string
  servingSize?: number
  servingSizeUnit?: string
  foodNutrients: USDANutrient[]
}

function getNutrient(nutrients: USDANutrient[], id: number): number | null {
  const n = nutrients.find((n) => n.nutrientId === id)
  return n ? Math.round(n.value * 10) / 10 : null
}

function mapUSDAFood(raw: USDAFood): FoodInput & { usda_fdc_id: string } {
  const brand = raw.brandName || raw.brandOwner || null

  return {
    name: raw.description,
    brand: brand,
    serving_size: raw.servingSize || 100,
    serving_unit: raw.servingSizeUnit?.toLowerCase() || 'g',
    calories: getNutrient(raw.foodNutrients, NUTRIENT_IDS.calories),
    protein_g: getNutrient(raw.foodNutrients, NUTRIENT_IDS.protein),
    carbs_g: getNutrient(raw.foodNutrients, NUTRIENT_IDS.carbs),
    fat_g: getNutrient(raw.foodNutrients, NUTRIENT_IDS.fat),
    fiber_g: getNutrient(raw.foodNutrients, NUTRIENT_IDS.fiber),
    total_sugars_g: getNutrient(raw.foodNutrients, NUTRIENT_IDS.total_sugars),
    source: 'usda',
    usda_fdc_id: String(raw.fdcId),
  }
}

export type USDASearchResult = ReturnType<typeof mapUSDAFood>

export async function searchUSDA(query: string): Promise<USDASearchResult[]> {
  const apiKey = import.meta.env.VITE_USDA_API_KEY
  if (!apiKey || !query.trim()) return []

  try {
    const params = new URLSearchParams({
      api_key: apiKey,
      query: query.trim(),
      pageSize: '15',
      dataType: 'Foundation,SR Legacy,Branded',
    })

    const res = await fetch(`${USDA_BASE}/foods/search?${params}`)
    if (!res.ok) return []

    const data = await res.json()
    return (data.foods ?? []).map(mapUSDAFood)
  } catch {
    return []
  }
}
