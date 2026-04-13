import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDailyTargets, useSaveTargets } from '@/hooks/useDailyTargets'

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein_g', label: 'Protein', unit: 'g' },
  { key: 'carbs_g', label: 'Carbs', unit: 'g' },
  { key: 'fat_g', label: 'Fat', unit: 'g' },
  { key: 'fiber_g', label: 'Fiber', unit: 'g' },
  { key: 'total_sugars_g', label: 'Total Sugars', unit: 'g' },
] as const

type MacroKey = (typeof MACRO_FIELDS)[number]['key']

interface TargetsFormProps {
  onSuccess?: () => void
}

export function TargetsForm({ onSuccess }: TargetsFormProps) {
  const { data: currentTargets } = useDailyTargets()
  const saveTargets = useSaveTargets()

  const [values, setValues] = useState<Record<MacroKey, string>>({
    calories: '',
    protein_g: '',
    carbs_g: '',
    fat_g: '',
    fiber_g: '',
    total_sugars_g: '',
  })

  useEffect(() => {
    if (currentTargets) {
      setValues({
        calories: currentTargets.calories?.toString() ?? '',
        protein_g: currentTargets.protein_g?.toString() ?? '',
        carbs_g: currentTargets.carbs_g?.toString() ?? '',
        fat_g: currentTargets.fat_g?.toString() ?? '',
        fiber_g: currentTargets.fiber_g?.toString() ?? '',
        total_sugars_g: currentTargets.total_sugars_g?.toString() ?? '',
      })
    }
  }, [currentTargets])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const today = new Date().toISOString().split('T')[0]
    saveTargets.mutate(
      {
        calories: values.calories ? Number(values.calories) : null,
        protein_g: values.protein_g ? Number(values.protein_g) : null,
        carbs_g: values.carbs_g ? Number(values.carbs_g) : null,
        fat_g: values.fat_g ? Number(values.fat_g) : null,
        fiber_g: values.fiber_g ? Number(values.fiber_g) : null,
        total_sugars_g: values.total_sugars_g ? Number(values.total_sugars_g) : null,
        effective_date: today,
      },
      {
        onSuccess: () => {
          toast.success('Targets saved')
          onSuccess?.()
        },
        onError: () => {
          toast.error('Failed to save targets')
        },
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {MACRO_FIELDS.map((field) => (
        <div key={field.key} className="flex items-center gap-3">
          <Label className="w-28 shrink-0 text-muted-foreground">
            {field.label}
          </Label>
          <div className="relative flex-1">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder="—"
              value={values[field.key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              className="pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {field.unit}
            </span>
          </div>
        </div>
      ))}
      <Button
        type="submit"
        disabled={saveTargets.isPending}
        className="mt-2 h-10 w-full text-base font-semibold"
      >
        {saveTargets.isPending ? 'Saving...' : 'Save Targets'}
      </Button>
    </form>
  )
}
