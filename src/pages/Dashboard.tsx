import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FirstRunModal } from '@/components/onboarding/FirstRunModal'
import { DateNav } from '@/components/dashboard/DateNav'
import { MacroRing } from '@/components/dashboard/MacroRing'
import { MacroBar } from '@/components/dashboard/MacroBar'
import { MealSummary } from '@/components/dashboard/MealSummary'
import { useDaySummary } from '@/hooks/useDaySummary'
import { MEAL_TYPES } from '@/lib/constants'
import { MACRO_COLORS } from '@/lib/constants'

export default function Dashboard() {
  const navigate = useNavigate()
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const { totals, targets, mealGroups, isLoading } = useDaySummary(date)

  return (
    <div className="mx-auto max-w-lg p-4 pt-6">
      <FirstRunModal />

      <DateNav date={date} onDateChange={setDate} />

      {isLoading ? (
        <p className="py-12 text-center text-muted-foreground">Loading...</p>
      ) : (
        <>
          <div className="mt-4 flex justify-center">
            <MacroRing
              current={totals.calories}
              target={targets?.calories ?? null}
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <MacroBar
              label="Protein"
              current={totals.protein_g}
              target={targets?.protein_g ?? null}
              color={MACRO_COLORS.protein}
            />
            <MacroBar
              label="Carbs"
              current={totals.carbs_g}
              target={targets?.carbs_g ?? null}
              color={MACRO_COLORS.carbs}
            />
            <MacroBar
              label="Fat"
              current={totals.fat_g}
              target={targets?.fat_g ?? null}
              color={MACRO_COLORS.fat}
            />
            <MacroBar
              label="Fiber"
              current={totals.fiber_g}
              target={targets?.fiber_g ?? null}
              color={MACRO_COLORS.fiber}
            />
            <MacroBar
              label="Sugars"
              current={totals.total_sugars_g}
              target={targets?.total_sugars_g ?? null}
              color={MACRO_COLORS.total_sugars}
            />
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {MEAL_TYPES.map((type) => (
              <MealSummary
                key={type}
                mealType={type}
                entries={mealGroups[type]}
                date={date}
              />
            ))}
          </div>

          {Object.values(mealGroups).every((g) => g.length === 0) && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">No food logged yet</p>
              <Button
                className="mt-3 shadow-[0_0_16px_rgba(0,240,255,0.3)]"
                onClick={() => navigate('/log')}
              >
                <Plus className="h-4 w-4" />
                Log Food
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
