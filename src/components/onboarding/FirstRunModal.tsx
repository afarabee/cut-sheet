import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { TargetsForm } from '@/components/settings/TargetsForm'
import { useDailyTargets } from '@/hooks/useDailyTargets'

export function FirstRunModal() {
  const { data: targets, isLoading } = useDailyTargets()

  if (isLoading || targets) return null

  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Cut Sheet</DialogTitle>
          <DialogDescription>
            Set your daily macro targets to get started tracking.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <TargetsForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
