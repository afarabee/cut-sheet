import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FoodCard } from '@/components/food/FoodCard'
import { useFoods, useDeleteFood, useToggleFavorite } from '@/hooks/useFoods'

export default function FoodLibrary() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const { data: foods, isLoading } = useFoods(search, favoritesOnly)
  const deleteFood = useDeleteFood()
  const toggleFavorite = useToggleFavorite()

  return (
    <div className="mx-auto max-w-lg p-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Food Library</h1>
        <Button size="sm" onClick={() => navigate('/log/custom')}>
          <Plus className="h-4 w-4" />
          Add Food
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your foods..."
          className="pl-9"
        />
      </div>

      <label className="mb-4 flex cursor-pointer items-center gap-2">
        <button
          type="button"
          onClick={() => setFavoritesOnly(!favoritesOnly)}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded border transition-colors',
            favoritesOnly
              ? 'border-primary bg-primary'
              : 'border-border bg-transparent hover:border-muted-foreground'
          )}
        >
          {favoritesOnly && <Star className="h-3 w-3 fill-primary-foreground text-primary-foreground" />}
        </button>
        <span className="text-sm text-muted-foreground">Favorites only</span>
      </label>

      {isLoading ? (
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      ) : !foods?.length ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            {search ? 'No foods match your search' : 'No foods saved yet'}
          </p>
          {!search && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/log/custom')}
            >
              Create your first food
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {foods.map((food) => (
            <div key={food.id} className="group relative">
              <FoodCard
                food={food}
                showFavorite
                onToggleFavorite={() =>
                  toggleFavorite.mutate({
                    id: food.id,
                    is_favorite: !food.is_favorite,
                  })
                }
                onSelect={() => navigate(`/log/custom`, { state: { editFood: food } })}
              />
              <button
                type="button"
                onClick={() => {
                  deleteFood.mutate(food.id, {
                    onSuccess: () => toast.success(`${food.name} deleted`),
                  })
                }}
                className="absolute right-2 top-2 hidden rounded p-1 text-destructive hover:bg-destructive/10 group-hover:block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
