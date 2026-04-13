import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, isToday, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'

interface DateNavProps {
  date: string
  onDateChange: (date: string) => void
}

export function DateNav({ date, onDateChange }: DateNavProps) {
  const parsed = parseISO(date)
  const today = isToday(parsed)

  const go = (delta: number) => {
    const next = addDays(parsed, delta)
    onDateChange(format(next, 'yyyy-MM-dd'))
  }

  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="icon" onClick={() => go(-1)}>
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="flex flex-col items-center">
        <span className="text-sm font-semibold text-foreground">
          {today ? 'Today' : format(parsed, 'EEE, MMM d')}
        </span>
        {today && (
          <span className="text-xs text-muted-foreground">
            {format(parsed, 'MMM d, yyyy')}
          </span>
        )}
      </div>

      <Button variant="ghost" size="icon" onClick={() => go(1)} disabled={today}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  )
}
