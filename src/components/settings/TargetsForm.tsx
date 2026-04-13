import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDailyTargets, useSaveTargets } from '@/hooks/useDailyTargets'

interface TargetsFormProps {
  onSuccess?: () => void
}

export function TargetsForm({ onSuccess }: TargetsFormProps) {
  const { data: currentTargets } = useDailyTargets()
  const saveTargets = useSaveTargets()

  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [caloriesOverride, setCaloriesOverride] = useState('')
  const [isCaloriesManual, setIsCaloriesManual] = useState(false)
  const [fiber, setFiber] = useState('')
  const [totalSugars, setTotalSugars] = useState('')

  useEffect(() => {
    if (currentTargets) {
      setProtein(currentTargets.protein_g?.toString() ?? '')
      setCarbs(currentTargets.carbs_g?.toString() ?? '')
      setFat(currentTargets.fat_g?.toString() ?? '')
      setFiber(currentTargets.fiber_g?.toString() ?? '')
      setTotalSugars(currentTargets.total_sugars_g?.toString() ?? '')

      // Check if stored calories match the macro math
      const calc = calcCalories(
        currentTargets.protein_g ?? 0,
        currentTargets.carbs_g ?? 0,
        currentTargets.fat_g ?? 0
      )
      if (currentTargets.calories && currentTargets.calories !== calc) {
        setCaloriesOverride(currentTargets.calories.toString())
        setIsCaloriesManual(true)
      }
    }
  }, [currentTargets])

  const calculatedCalories = useMemo(
    () => calcCalories(Number(protein) || 0, Number(carbs) || 0, Number(fat) || 0),
    [protein, carbs, fat]
  )

  const displayCalories = isCaloriesManual
    ? Number(caloriesOverride) || 0
    : calculatedCalories

  const mismatch = isCaloriesManual && caloriesOverride
    ? Math.abs(Number(caloriesOverride) - calculatedCalories)
    : 0

  const handleCaloriesChange = (val: string) => {
    setCaloriesOverride(val)
    setIsCaloriesManual(true)
  }

  const handleCaloriesBlur = () => {
    // If user clears the field or enters a value matching the calculation, revert to auto
    if (!caloriesOverride || Number(caloriesOverride) === calculatedCalories) {
      setIsCaloriesManual(false)
      setCaloriesOverride('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const today = new Date().toISOString().split('T')[0]
    saveTargets.mutate(
      {
        calories: displayCalories || null,
        protein_g: protein ? Number(protein) : null,
        carbs_g: carbs ? Number(carbs) : null,
        fat_g: fat ? Number(fat) : null,
        fiber_g: fiber ? Number(fiber) : null,
        total_sugars_g: totalSugars ? Number(totalSugars) : null,
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
      {/* Macro inputs in nutrition label order — fat, carbs, protein drive calories */}
      <MacroInput label="Fat" unit="g" value={fat} onChange={setFat} />
      <MacroInput label="Carbs" unit="g" value={carbs} onChange={setCarbs} />
      <MacroInput label="Protein" unit="g" value={protein} onChange={setProtein} />

      {/* Calories — auto-calculated with manual override */}
      <div>
        <div className="flex items-center gap-3">
          <Label className="w-28 shrink-0 text-muted-foreground">Calories</Label>
          <div className="relative flex-1">
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              placeholder={calculatedCalories ? String(calculatedCalories) : '—'}
              value={isCaloriesManual ? caloriesOverride : (calculatedCalories || '')}
              onChange={(e) => handleCaloriesChange(e.target.value)}
              onBlur={handleCaloriesBlur}
              className="pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              kcal
            </span>
          </div>
        </div>

        {/* Show the math */}
        {(protein || carbs || fat) && (
          <p className="mt-1 pl-[7.75rem] text-xs text-muted-foreground">
            F({fat || 0})×9 + C({carbs || 0})×4 + P({protein || 0})×4 = {calculatedCalories} cal
          </p>
        )}

        {/* Mismatch warning */}
        {mismatch > 5 && (
          <div className="mt-1.5 flex items-start gap-1.5 pl-[7.75rem]">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
            <p className="text-xs text-secondary">
              Manual calories ({caloriesOverride}) differ from macro math ({calculatedCalories}) by {Math.round(mismatch)} cal
            </p>
          </div>
        )}
      </div>

      <hr className="border-border" />

      <MacroInput label="Fiber" unit="g" value={fiber} onChange={setFiber} />
      <MacroInput label="Total Sugars" unit="g" value={totalSugars} onChange={setTotalSugars} />

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

function MacroInput({
  label,
  unit,
  value,
  onChange,
}: {
  label: string
  unit: string
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Label className="w-28 shrink-0 text-muted-foreground">{label}</Label>
      <div className="relative flex-1">
        <Input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="—"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  )
}

function calcCalories(protein: number, carbs: number, fat: number): number {
  return Math.round(protein * 4 + carbs * 4 + fat * 9)
}
