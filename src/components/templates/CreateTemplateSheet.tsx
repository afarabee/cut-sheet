import { useState } from 'react'
import { Search, X, Minus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FoodCard } from '@/components/food/FoodCard'
import { CreateFoodSheet } from '@/components/food/CreateFoodSheet'
import { useFoodSearch } from '@/hooks/useFoodSearch'
import { useCreateTemplate } from '@/hooks/useMealTemplates'
import type { Food } from '@/types'

interface TemplateItem {
  food: Food
  servingQty: number
}

interface CreateTemplateSheetProps {
  onDone: () => void
  onCancel: () => void
  /** Pre-fill items (used by "Save as Template" from dashboard) */
  prefillName?: string
  prefillItems?: TemplateItem[]
}

export function CreateTemplateSheet({
  onDone,
  onCancel,
  prefillName,
  prefillItems,
}: CreateTemplateSheetProps) {
  const [name, setName] = useState(prefillName ?? '')
  const [items, setItems] = useState<TemplateItem[]>(prefillItems ?? [])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(!prefillItems?.length)
  const [showCreateFood, setShowCreateFood] = useState(false)

  const { localResults, isSearching } = useFoodSearch(searchQuery)
  const createTemplate = useCreateTemplate()

  const addFood = (food: Food) => {
    if (items.some((i) => i.food.id === food.id)) return
    setItems((prev) => [...prev, { food, servingQty: 1 }])
    setSearchQuery('')
    setShowSearch(false)
  }

  const removeFood = (foodId: string) => {
    setItems((prev) => prev.filter((i) => i.food.id !== foodId))
  }

  const updateQty = (foodId: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.food.id === foodId
          ? { ...i, servingQty: Math.max(0.5, Math.round((i.servingQty + delta) * 10) / 10) }
          : i
      )
    )
  }

  const totalCals = items.reduce(
    (s, i) => s + (i.food.calories ?? 0) * i.servingQty,
    0
  )

  const handleSave = () => {
    if (!name.trim() || items.length === 0) return

    createTemplate.mutate(
      {
        name: name.trim(),
        items: items.map((i) => ({
          food_id: i.food.id,
          food_name: i.food.name,
          serving_qty: i.servingQty,
          serving_size: i.food.serving_size,
          serving_unit: i.food.serving_unit,
          calories: i.food.calories,
          protein_g: i.food.protein_g,
          carbs_g: i.food.carbs_g,
          fat_g: i.food.fat_g,
          fiber_g: i.food.fiber_g,
          total_sugars_g: i.food.total_sugars_g,
        })),
      },
      {
        onSuccess: () => {
          toast.success(`Template "${name.trim()}" saved`)
          onDone()
        },
        onError: () => toast.error('Failed to save template'),
      }
    )
  }

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[90dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

        <h3 className="text-lg font-semibold text-foreground">
          {prefillItems ? 'Save as Template' : 'Create Template'}
        </h3>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name (e.g., My usual breakfast)"
          className="mt-3"
          autoFocus
        />

        {/* Current items */}
        {items.length > 0 && (
          <div className="mt-4 flex flex-col gap-1">
            <p className="text-xs font-medium text-muted-foreground">
              Items ({items.length}) · {Math.round(totalCals)} cal
            </p>
            {items.map((item) => (
              <div
                key={item.food.id}
                className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{item.food.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((item.food.calories ?? 0) * item.servingQty)} cal
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQty(item.food.id, -0.5)}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-medium text-foreground">
                    {item.servingQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.food.id, 0.5)}
                    className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFood(item.food.id)}
                  className="rounded p-1 text-destructive hover:bg-destructive/10"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add foods */}
        {showSearch ? (
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foods to add..."
                className="pl-9"
              />
            </div>
            {isSearching && localResults.length > 0 && (
              <div className="mt-2 flex max-h-48 flex-col gap-1 overflow-y-auto">
                {localResults.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    onSelect={() => addFood(food)}
                  />
                ))}
              </div>
            )}
            {isSearching && localResults.length === 0 && (
              <div className="mt-3 flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">No matches in your library</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateFood(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create "{searchQuery}"
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowSearch(true)}
            className="mt-3 w-full"
          >
            Add Food
          </Button>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={handleSave}
            disabled={createTemplate.isPending || !name.trim() || items.length === 0}
            className="h-12 w-full text-base font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            {createTemplate.isPending ? 'Saving...' : 'Save Template'}
          </Button>
          <Button variant="ghost" onClick={onCancel} className="w-full text-muted-foreground">
            Cancel
          </Button>
        </div>
      </div>
    </div>

    {showCreateFood && (
      <CreateFoodSheet
        initialName={searchQuery}
        onCreated={(food) => {
          setShowCreateFood(false)
          setSearchQuery('')
          addFood(food)
        }}
        onCancel={() => setShowCreateFood(false)}
      />
    )}
    </>
  )
}
