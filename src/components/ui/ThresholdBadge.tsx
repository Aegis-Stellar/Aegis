import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThresholdBadgeProps {
  threshold: number
  total: number
  className?: string
  withIcon?: boolean
}

export function ThresholdBadge({ threshold, total, className, withIcon = true }: ThresholdBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {withIcon && <ShieldCheck className="size-3.5 text-primary" />}
      <span>
        <span className="font-semibold text-foreground">{threshold}</span>
        <span className="text-muted-foreground"> of </span>
        <span className="font-semibold text-foreground">{total}</span>
      </span>
    </span>
  )
}
