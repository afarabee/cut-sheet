import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ScanBarcode, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MealTypeSelector } from '@/components/log/MealTypeSelector'
import { PortionSheet } from '@/components/log/PortionSheet'
import { FoodCard } from '@/components/food/FoodCard'
import { useFoodSearch } from '@/hooks/useFoodSearch'
import { useAddLogEntry } from '@/hooks/useLogEntries'
import { useCreateFood } from '@/hooks/useFoods'
import { getDefaultMealType, type MealType } from '@/lib/constants'
import type { Food } from '@/types'
import type { USDASearchResult } from '@/lib/usda'

export default function LogFood() {
  const navigate = useNavigate()
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<Food | USDASearchResult | null>(null)
  const [pendingUSDA, setPendingUSDA] = useState<USDASearchResult | null>(null)

  const { localResults, usdaResults, isSearching } = useFoodSearch(searchQuery)
  const addLogEntry = useAddLogEntry()
  const createFood = useCreateFood()

  const today = new Date().toISOString().split('T')[0]

  const handleSelectFood = (food: Food | USDASearchResult, isUSDA: boolean) => {
    if (isUSDA) {
      setPendingUSDA(food as USDASearchResult)
    }
    setSelectedFood(food)
  }

  const handleLog = async (servings: number) => {
    if (!selectedFood) return

    let foodId: string | null = null
    let foodToLog = selectedFood

    // If it's a USDA result, save to local DB first
    if (pendingUSDA) {
      try {
        const saved = await createFood.mutateAsync({
          ...pendingUSDA,
          source: 'usda',
        })
        foodId = saved.id
        foodToLog = saved
      } catch {
        toast.error('Failed to save food')
        return
      }
    } else if ('id' in selectedFood) {
      foodId = selectedFood.id
    }

    addLogEntry.mutate(
      {
        food_id: foodId,
        food_name: foodToLog.name,
        serving_qty: servings,
        serving_size: foodToLog.serving_size,
        serving_unit: foodToLog.serving_unit,
        calories: Math.round((foodToLog.calories ?? 0) * servings),
        protein_g: Math.round((foodToLog.protein_g ?? 0) * servings * 10) / 10,
        carbs_g: Math.round((foodToLog.carbs_g ?? 0) * servings * 10) / 10,
        fat_g: Math.round((foodToLog.fat_g ?? 0) * servings * 10) / 10,
        fiber_g: Math.round((foodToLog.fiber_g ?? 0) * servings * 10) / 10,
        total_sugars_g: Math.round((foodToLog.total_sugars_g ?? 0) * servings * 10) / 10,
        meal_type: mealType,
        entry_method: 'manual',
        logged_at: today,
      },
      {
        onSuccess: () => {
          toast.success(`${foodToLog.name} logged`)
          setSelectedFood(null)
          setPendingUSDA(null)
          setSearchQuery('')
        },
        onError: () => {
          toast.error('Failed to log food')
        },
      }
    )
  }

  return (
    <div className="mx-auto max-w-lg p-4 pt-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Log Food</h1>

      <MealTypeSelector value={mealType} onChange={setMealType} />

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search foods..."
            className="pl-9"
            autoFocus
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/log/scan')}
          title="Scan barcode"
        >
          <ScanBarcode className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/log/custom')}
          title="Create custom food"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {isSearching && localResults.length === 0 && usdaResults.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No results found
          </p>
        )}

        {localResults.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground">Your Foods</p>
            {localResults.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onSelect={() => handleSelectFood(food, false)}
              />
            ))}
          </>
        )}

        {usdaResults.length > 0 && (
          <>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
              USDA Database
            </p>
            {usdaResults.map((food, i) => (
              <FoodCard
                key={`usda-${i}`}
                food={food}
                isUSDA
                onSelect={() => handleSelectFood(food, true)}
              />
            ))}
          </>
        )}

        {!isSearching && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Start typing to search foods
          </p>
        )}
      </div>

      {selectedFood && (
        <PortionSheet
          food={selectedFood}
          onConfirm={handleLog}
          onCancel={() => {
            setSelectedFood(null)
            setPendingUSDA(null)
          }}
          isPending={addLogEntry.isPending || createFood.isPending}
        />
      )}
    </div>
  )
}
