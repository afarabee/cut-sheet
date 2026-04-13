import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Food } from '@/types'
import type { USDASearchResult } from '@/lib/usda'

interface PortionSheetProps {
  food: Food | USDASearchResult
  initialServings?: number
  onConfirm: (servings: number) => void
  onCancel: () => void
  isPending?: boolean
  confirmLabel?: string
}

export function PortionSheet({
  food,
  initialServings = 1,
  onConfirm,
  onCancel,
  isPending,
  confirmLabel = 'Log It',
}: PortionSheetProps) {
  const [servingsInput, setServingsInput] = useState(String(initialServings))
  const servings = Number(servingsInput) || 0

  const adjust = (delta: number) => {
    const next = Math.max(0.1, Math.round((servings + delta) * 10) / 10)
    setServingsInput(String(next))
  }

  const cal = Math.round((food.calories ?? 0) * servings)
  const protein = Math.round((food.protein_g ?? 0) * servings * 10) / 10
  const carbs = Math.round((food.carbs_g ?? 0) * servings * 10) / 10
  const fat = Math.round((food.fat_g ?? 0) * servings * 10) / 10

  return (
    <div className="fixed inset-0 z-[60] flex items-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

        <h3 className="text-lg font-semibold text-foreground">{food.name}</h3>
        {food.brand && (
          <p className="text-sm text-muted-foreground">{food.brand}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          per {food.serving_size ?? 100}{food.serving_unit ?? 'g'}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => adjust(-0.5)}
            disabled={servings <= 0.5}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            inputMode="decimal"
            min={0.1}
            step="any"
            value={servingsInput}
            onChange={(e) => setServingsInput(e.target.value)}
            className="h-10 w-20 text-center text-xl font-bold"
          />
          <Button variant="outline" size="icon" onClick={() => adjust(0.5)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1 text-center text-xs text-muted-foreground">servings</p>

        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{cal}</p>
            <p className="text-xs text-muted-foreground">cal</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-neon-pink">{fat}g</p>
            <p className="text-xs text-muted-foreground">fat</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-neon-purple">{carbs}g</p>
            <p className="text-xs text-muted-foreground">carbs</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-neon-green">{protein}g</p>
            <p className="text-xs text-muted-foreground">protein</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={() => onConfirm(servings)}
            disabled={isPending || servings <= 0}
            className="h-12 w-full text-base font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)]"
          >
            {isPending ? 'Saving...' : confirmLabel}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full text-muted-foreground"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
