import * as React from "react"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<"div"> {
  value?: number
  max?: number
  indicatorClassName?: string
  indicatorColor?: string
}

function Progress({
  className,
  value = 0,
  max = 100,
  indicatorClassName,
  indicatorColor,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full transition-all duration-500 ease-out",
          !indicatorColor && "bg-primary",
          indicatorClassName
        )}
        style={{
          width: `${percentage}%`,
          ...(indicatorColor ? { backgroundColor: indicatorColor } : {}),
        }}
      />
    </div>
  )
}

export { Progress }
