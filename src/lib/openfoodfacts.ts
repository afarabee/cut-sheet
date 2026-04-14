import type { FoodInput } from '@/types'

const OFF_BASE = 'https://world.openfoodfacts.org/api/v2/product'

interface OFFNutriments {
  'energy-kcal_100g'?: number
  'energy-kcal_serving'?: number
  fat_100g?: number
  fat_serving?: number
  carbohydrates_100g?: number
  carbohydrates_serving?: number
  fiber_100g?: number
  fiber_serving?: number
  sugars_100g?: number
  sugars_serving?: number
  proteins_100g?: number
  proteins_serving?: number
}

interface OFFProduct {
  product_name?: string
  brands?: string
  serving_size?: string
  serving_quantity?: number
  nutriments?: OFFNutriments
}

function round1(n: number | undefined): number | null {
  if (n === undefined || n === null) return null
  return Math.round(n * 10) / 10
}

function parseServingSize(raw?: string): { size: number; unit: string } | null {
  if (!raw) return null
  const match = raw.match(/^([\d.]+)\s*(g|ml|oz|cup|tbsp|tsp|each)?/i)
  if (!match) return null
  return { size: Number(match[1]), unit: (match[2] || 'g').toLowerCase() }
}

export async function lookupBarcode(barcode: string): Promise<(FoodInput & { barcode: string }) | null> {
  try {
    const res = await fetch(
      `${OFF_BASE}/${barcode}?fields=product_name,brands,nutriments,serving_size,serving_quantity`
    )
    if (!res.ok) return null

    const data = await res.json()
    if (data.status !== 1 || !data.product) return null

    const p: OFFProduct = data.product
    const n = p.nutriments

    if (!p.product_name || !n) return null

    // Prefer per-serving values if available, fall back to per-100g
    const hasServing = n['energy-kcal_serving'] !== undefined
    const serving = parseServingSize(p.serving_size)

    return {
      name: p.product_name,
      brand: p.brands || null,
      serving_size: hasServing && serving ? serving.size : 100,
      serving_unit: hasServing && serving ? serving.unit : 'g',
      calories: round1(hasServing ? n['energy-kcal_serving'] : n['energy-kcal_100g']),
      fat_g: round1(hasServing ? n.fat_serving : n.fat_100g),
      carbs_g: round1(hasServing ? n.carbohydrates_serving : n.carbohydrates_100g),
      fiber_g: round1(hasServing ? n.fiber_serving : n.fiber_100g),
      total_sugars_g: round1(hasServing ? n.sugars_serving : n.sugars_100g),
      protein_g: round1(hasServing ? n.proteins_serving : n.proteins_100g),
      source: 'barcode',
      barcode,
    }
  } catch {
    return null
  }
}
