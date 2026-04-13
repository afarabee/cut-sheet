import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TargetsForm } from '@/components/settings/TargetsForm'
import { useDailyTargets } from '@/hooks/useDailyTargets'

export function FirstRunModal() {
  const { data: targets, isLoading } = useDailyTargets()
  const [dismissed, setDismissed] = useState(false)

  if (isLoading || targets || dismissed) return null

  return (
    <Dialog open onOpenChange={() => setDismissed(true)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Welcome to Cut Sheet</DialogTitle>
          <DialogDescription>
            Set your daily macro targets to track progress, or skip this and just log food.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <TargetsForm onSuccess={() => setDismissed(true)} />
          <Button
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="mt-2 w-full text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
