import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FoodInput } from '@/types'

const SERVING_UNITS = ['g', 'oz', 'ml', 'cup', 'tbsp', 'tsp', 'each'] as const

interface FoodFormProps {
  initialValues?: Partial<FoodInput>
  onSubmit: (food: FoodInput) => void
  isPending?: boolean
  submitLabel?: string
}

export function FoodForm({
  initialValues,
  onSubmit,
  isPending,
  submitLabel = 'Save Food',
}: FoodFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [brand, setBrand] = useState(initialValues?.brand ?? '')
  const [servingSize, setServingSize] = useState(
    initialValues?.serving_size?.toString() ?? '100'
  )
  const [servingUnit, setServingUnit] = useState(
    initialValues?.serving_unit ?? 'g'
  )
  const [calories, setCalories] = useState(
    initialValues?.calories?.toString() ?? ''
  )
  const [protein, setProtein] = useState(
    initialValues?.protein_g?.toString() ?? ''
  )
  const [carbs, setCarbs] = useState(
    initialValues?.carbs_g?.toString() ?? ''
  )
  const [fat, setFat] = useState(initialValues?.fat_g?.toString() ?? '')
  const [fiber, setFiber] = useState(
    initialValues?.fiber_g?.toString() ?? ''
  )
  const [totalSugars, setTotalSugars] = useState(
    initialValues?.total_sugars_g?.toString() ?? ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      brand: brand.trim() || null,
      serving_size: servingSize ? Number(servingSize) : null,
      serving_unit: servingUnit,
      calories: calories ? Number(calories) : null,
      protein_g: protein ? Number(protein) : null,
      carbs_g: carbs ? Number(carbs) : null,
      fat_g: fat ? Number(fat) : null,
      fiber_g: fiber ? Number(fiber) : null,
      total_sugars_g: totalSugars ? Number(totalSugars) : null,
      source: initialValues?.source ?? 'custom',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label>Food Name *</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Chicken breast, raw"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>Brand (optional)</Label>
        <Input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="e.g., Kirkland"
          className="mt-1"
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <Label>Serving Size</Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={servingSize}
            onChange={(e) => setServingSize(e.target.value)}
            className="mt-1"
          />
        </div>
        <div className="w-24">
          <Label>Unit</Label>
          <select
            value={servingUnit}
            onChange={(e) => setServingUnit(e.target.value)}
            className="mt-1 h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {SERVING_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Calories</Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="—"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Protein (g)</Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="—"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Carbs (g)</Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            placeholder="—"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Fat (g)</Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            placeholder="—"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Fiber (g)</Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={fiber}
            onChange={(e) => setFiber(e.target.value)}
            placeholder="—"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Sugars (g)</Label>
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            step="any"
            value={totalSugars}
            onChange={(e) => setTotalSugars(e.target.value)}
            placeholder="—"
            className="mt-1"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending || !name.trim()}
        className="mt-2 h-10 w-full text-base font-semibold"
      >
        {isPending ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}
