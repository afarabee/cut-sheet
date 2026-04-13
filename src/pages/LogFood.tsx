import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ScanBarcode, Plus, Star, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MealTypeSelector } from '@/components/log/MealTypeSelector'
import { PortionSheet } from '@/components/log/PortionSheet'
import { FoodCard } from '@/components/food/FoodCard'
import { useFoodSearch, useFavorites, useRecentFoods } from '@/hooks/useFoodSearch'
import { useAddLogEntry } from '@/hooks/useLogEntries'
import { useCreateFood } from '@/hooks/useFoods'
import { getDefaultMealType, type MealType } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Food } from '@/types'
import type { USDASearchResult } from '@/lib/usda'

type FilterMode = 'search' | 'favorites' | 'recents'

export default function LogFood() {
  const navigate = useNavigate()
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType())
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('search')
  const [selectedFood, setSelectedFood] = useState<Food | USDASearchResult | null>(null)
  const [pendingUSDA, setPendingUSDA] = useState<USDASearchResult | null>(null)

  const { localResults, usdaResults, isLoading, isSearching } = useFoodSearch(searchQuery)
  const { data: favorites } = useFavorites()
  const { data: recents } = useRecentFoods()
  const addLogEntry = useAddLogEntry()
  const createFood = useCreateFood()

  const today = new Date().toISOString().split('T')[0]

  const handleSelectFood = (food: Food | USDASearchResult, isUSDA: boolean) => {
    if (isUSDA) {
      setPendingUSDA(food as USDASearchResult)
    } else {
      setPendingUSDA(null)
    }
    setSelectedFood(food)
  }

  const handleLog = async (servings: number) => {
    if (!selectedFood) return

    let foodId: string | null = null
    let foodToLog = selectedFood

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

  const showSearch = filterMode === 'search'
  const showFavorites = filterMode === 'favorites'
  const showRecents = filterMode === 'recents'

  return (
    <div className="mx-auto max-w-lg p-4 pt-6">
      <h1 className="mb-4 text-xl font-bold text-foreground">Log Food</h1>

      <MealTypeSelector value={mealType} onChange={setMealType} />

      {/* Filter tabs */}
      <div className="mt-4 flex gap-1 rounded-lg bg-muted p-1">
        <FilterTab
          active={showSearch}
          onClick={() => setFilterMode('search')}
          icon={<Search className="h-3.5 w-3.5" />}
          label="Search"
        />
        <FilterTab
          active={showFavorites}
          onClick={() => setFilterMode('favorites')}
          icon={<Star className="h-3.5 w-3.5" />}
          label={`Favorites${favorites?.length ? ` (${favorites.length})` : ''}`}
        />
        <FilterTab
          active={showRecents}
          onClick={() => setFilterMode('recents')}
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Recents"
        />
      </div>

      {/* Search bar — only visible in search mode */}
      {showSearch && (
        <div className="mt-3 flex gap-2">
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
      )}

      {/* Results area */}
      <div className="mt-4 flex flex-col gap-2">

        {/* Search mode */}
        {showSearch && (
          <>
            {isLoading && isSearching && (
              <p className="py-4 text-center text-sm text-muted-foreground">Searching...</p>
            )}

            {!isLoading && isSearching && localResults.length === 0 && usdaResults.length === 0 && (
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
          </>
        )}

        {/* Favorites mode */}
        {showFavorites && (
          <>
            {!favorites?.length ? (
              <div className="py-12 text-center">
                <Star className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No favorites yet</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Star a food in the Food Library to see it here
                </p>
              </div>
            ) : (
              favorites.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onSelect={() => handleSelectFood(food, false)}
                />
              ))
            )}
          </>
        )}

        {/* Recents mode */}
        {showRecents && (
          <>
            {!recents?.length ? (
              <div className="py-12 text-center">
                <Clock className="mx-auto h-8 w-8 text-muted-foreground/40" />
                <p className="mt-2 text-sm text-muted-foreground">No recent foods</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Foods you log will appear here
                </p>
              </div>
            ) : (
              recents.map((food) => (
                <FoodCard
                  key={food.id}
                  food={food}
                  onSelect={() => handleSelectFood(food, false)}
                />
              ))
            )}
          </>
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

function FilterTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
        active
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
