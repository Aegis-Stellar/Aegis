import { Check, Clock, X, Zap } from "lucide-react"
import type { TxStatus } from "@/types/safe"
import { Badge } from "@/components/ui/badge"

const map: Record<TxStatus, { label: string; variant: "warning" | "success" | "muted" | "destructive"; Icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Awaiting approvals", variant: "warning", Icon: Clock },
  ready: { label: "Ready to execute", variant: "success", Icon: Zap },
  executed: { label: "Executed", variant: "muted", Icon: Check },
  cancelled: { label: "Cancelled", variant: "destructive", Icon: X },
}

export function TxStatusBadge({ status, className }: { status: TxStatus; className?: string }) {
  const { label, variant, Icon } = map[status]
  return (
    <Badge variant={variant} className={className}>
      <Icon className="size-3" />
      {label}
    </Badge>
  )
}
