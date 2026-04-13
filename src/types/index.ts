export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
export type FoodSource = 'custom' | 'usda' | 'barcode'

export interface Food {
  id: string
  name: string
  brand: string | null
  serving_size: number | null
  serving_unit: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  total_sugars_g: number | null
  source: FoodSource
  usda_fdc_id: string | null
  barcode: string | null
  is_favorite: boolean
  created_at: string
}

export interface FoodInput {
  name: string
  brand?: string | null
  serving_size?: number | null
  serving_unit?: string | null
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  fiber_g?: number | null
  total_sugars_g?: number | null
  source?: FoodSource
  usda_fdc_id?: string | null
  barcode?: string | null
  is_favorite?: boolean
}

export interface LogEntry {
  id: string
  food_id: string | null
  food_name: string
  serving_qty: number | null
  serving_size: number | null
  serving_unit: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  total_sugars_g: number | null
  meal_type: MealType
  entry_method: string
  logged_at: string
  created_at: string
}

export interface LogEntryInput {
  food_id?: string | null
  food_name: string
  serving_qty?: number | null
  serving_size?: number | null
  serving_unit?: string | null
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  fiber_g?: number | null
  total_sugars_g?: number | null
  meal_type: MealType
  entry_method?: string
  logged_at: string
}

export interface DailyTargets {
  id: string
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  total_sugars_g: number | null
  effective_date: string
  created_at: string
}

export interface DailyTargetsInput {
  calories?: number | null
  protein_g?: number | null
  carbs_g?: number | null
  fat_g?: number | null
  fiber_g?: number | null
  total_sugars_g?: number | null
  effective_date: string
}

export interface MealTemplate {
  id: string
  name: string
  created_at: string
  updated_at: string
  items?: MealTemplateItem[]
}

export interface MealTemplateItem {
  id: string
  template_id: string
  food_id: string
  food_name: string
  serving_qty: number | null
  serving_size: number | null
  serving_unit: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  total_sugars_g: number | null
  sort_order: number
}

export interface MacroTotals {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  total_sugars_g: number
}
