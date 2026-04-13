export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export type MealType = (typeof MEAL_TYPES)[number]

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
}

export function getDefaultMealType(): MealType {
  const hour = new Date().getHours()
  if (hour < 11) return 'breakfast'
  if (hour < 14) return 'lunch'
  if (hour < 18) return 'dinner'
  return 'snack'
}

export const MACRO_COLORS = {
  calories: 'var(--neon-cyan)',
  protein: 'var(--neon-green)',
  carbs: 'var(--neon-purple)',
  fat: 'var(--neon-pink)',
  fiber: 'var(--muted-foreground)',
  total_sugars: 'var(--muted-foreground)',
} as const
