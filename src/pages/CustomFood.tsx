import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FoodForm } from '@/components/food/FoodForm'
import { useCreateFood } from '@/hooks/useFoods'

export default function CustomFood() {
  const navigate = useNavigate()
  const createFood = useCreateFood()

  return (
    <div className="mx-auto max-w-lg p-4 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Create Custom Food</h1>
      </div>

      <FoodForm
        onSubmit={(food) => {
          createFood.mutate(food, {
            onSuccess: () => {
              toast.success(`${food.name} saved`)
              navigate('/foods')
            },
            onError: () => {
              toast.error('Failed to save food')
            },
          })
        }}
        isPending={createFood.isPending}
      />
    </div>
  )
}
