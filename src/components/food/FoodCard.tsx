import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Food } from '@/types'
import type { USDASearchResult } from '@/lib/usda'

interface FoodCardProps {
  food: Food | USDASearchResult
  isUSDA?: boolean
  onSelect?: () => void
  onToggleFavorite?: () => void
  showFavorite?: boolean
}

export function FoodCard({
  food,
  isUSDA,
  onSelect,
  onToggleFavorite,
  showFavorite = false,
}: FoodCardProps) {
  const isFavorite = 'is_favorite' in food ? food.is_favorite : false

  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50 active:bg-muted"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-foreground">
            {food.name}
          </span>
          {isUSDA && (
            <span className="shrink-0 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              USDA
            </span>
          )}
        </div>
        {food.brand && (
          <p className="truncate text-xs text-muted-foreground">{food.brand}</p>
        )}
        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
          <span>{food.calories ?? 0} cal</span>
          <span className="text-neon-green">P {food.protein_g ?? 0}g</span>
          <span className="text-neon-purple">C {food.carbs_g ?? 0}g</span>
          <span className="text-neon-pink">F {food.fat_g ?? 0}g</span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground/60">
          per {food.serving_size ?? 100}{food.serving_unit ?? 'g'}
        </p>
      </div>

      {showFavorite && onToggleFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          className="shrink-0 p-1"
        >
          <Star
            className={cn(
              'h-4 w-4 transition-colors',
              isFavorite
                ? 'fill-primary text-primary'
                : 'text-muted-foreground hover:text-primary'
            )}
          />
        </button>
      )}
    </button>
  )
}
