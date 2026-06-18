import { Link } from "react-router-dom"
import { ArrowUpRight, Clock } from "lucide-react"
import type { Safe } from "@/types/safe"
import { Identicon } from "@/components/ui/identicon"
import { ThresholdBadge } from "@/components/ui/ThresholdBadge"
import { Badge } from "@/components/ui/badge"
import { AddressDisplay } from "@/components/ui/AddressDisplay"
import { formatUsd } from "@/lib/format"

export function SafeCard({ safe }: { safe: Safe }) {
  const total = safe.balances.reduce((sum, b) => sum + b.usdValue, 0)
  const pending = safe.transactions.filter((t) => t.status === "pending" || t.status === "ready").length

  return (
    <Link
      to={`/app/safe/${safe.id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-black/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Identicon address={safe.address} className="size-10" />
          <div>
            <div className="font-semibold leading-tight">{safe.name}</div>
            <AddressDisplay address={safe.address} chars={4} showCopy={false} className="mt-0.5" />
          </div>
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>

      <div className="mt-5">
        <div className="text-xs text-muted-foreground">Total balance</div>
        <div className="mt-0.5 text-2xl font-bold tracking-tight">{formatUsd(total)}</div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <ThresholdBadge threshold={safe.threshold} total={safe.owners.length} />
        {pending > 0 ? (
          <Badge variant="warning">
            <Clock className="size-3" />
            {pending} pending
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">No pending txs</span>
        )}
      </div>
    </Link>
  )
}
