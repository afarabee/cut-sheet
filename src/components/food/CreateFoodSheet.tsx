import { toast } from 'sonner'
import { FoodForm } from './FoodForm'
import { Button } from '@/components/ui/button'
import { useCreateFood } from '@/hooks/useFoods'
import type { Food, FoodInput } from '@/types'

interface CreateFoodSheetProps {
  initialName?: string
  initialBarcode?: string
  onCreated: (food: Food) => void
  onCancel: () => void
}

export function CreateFoodSheet({ initialName, initialBarcode, onCreated, onCancel }: CreateFoodSheetProps) {
  const createFood = useCreateFood()

  const initialValues: Partial<FoodInput> | undefined = initialName || initialBarcode
    ? {
        ...(initialName ? { name: initialName } : {}),
        ...(initialBarcode ? { barcode: initialBarcode, source: 'barcode' as const } : {}),
      }
    : undefined

  const handleSubmit = (input: FoodInput) => {
    createFood.mutate(input, {
      onSuccess: (food) => {
        toast.success(`${food.name} saved`)
        onCreated(food)
      },
      onError: () => toast.error('Failed to save food'),
    })
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-end" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-h-[90dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-24"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted-foreground/30" />

        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Create Custom Food
        </h3>

        <FoodForm
          initialValues={initialValues}
          onSubmit={handleSubmit}
          isPending={createFood.isPending}
          submitLabel="Save & Continue"
        />

        <Button
          variant="ghost"
          onClick={onCancel}
          className="mt-2 w-full text-muted-foreground"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
