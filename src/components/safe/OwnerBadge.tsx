import { Check, Clock } from "lucide-react"
import type { Owner } from "@/types/safe"
import { Identicon } from "@/components/ui/identicon"
import { AddressDisplay } from "@/components/ui/AddressDisplay"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OwnerBadgeProps {
  owner: Owner
  isCurrentUser?: boolean
  /** approval status when used inside an approval tracker */
  approved?: boolean
  /** optional approval timestamp label */
  meta?: string
  className?: string
}

export function OwnerBadge({ owner, isCurrentUser, approved, meta, className }: OwnerBadgeProps) {
  const showStatus = approved !== undefined
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border border-border bg-background/50 px-3 py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Identicon address={owner.address} className="size-8" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium">
              {owner.label || "Owner"}
            </span>
            {isCurrentUser && <Badge variant="muted" className="px-1.5 py-0 text-[10px]">You</Badge>}
          </div>
          <AddressDisplay address={owner.address} chars={4} showCopy={!showStatus} />
        </div>
      </div>
      {showStatus &&
        (approved ? (
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--success)]">
              <Check className="size-3.5" /> Approved
            </span>
            {meta && <span className="text-[11px] text-muted-foreground">{meta}</span>}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3.5" /> Pending
          </span>
        ))}
    </div>
  )
}
