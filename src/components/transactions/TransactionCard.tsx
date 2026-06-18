import { Link } from "react-router-dom"
import { ArrowUpRight, ChevronRight, Zap } from "lucide-react"
import type { Safe, SafeTransaction } from "@/types/safe"
import { TxStatusBadge } from "@/components/transactions/TxStatusBadge"
import { Badge } from "@/components/ui/badge"
import { formatToken, shortenAddress, timeAgo } from "@/lib/format"

export function TransactionCard({ safe, tx }: { safe: Safe; tx: SafeTransaction }) {
  const approvals = tx.approvals.length
  return (
    <Link
      to={`/app/safe/${safe.id}/tx/${tx.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <ArrowUpRight className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {tx.description || "Transfer"}
          </span>
          {tx.viaPolicy && (
            <Badge variant="default" className="px-1.5 py-0 text-[10px]">
              <Zap className="size-2.5" /> Policy
            </Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">#{tx.nonce}</span>
          <span>·</span>
          <span className="font-mono">→ {shortenAddress(tx.to, 4)}</span>
          <span>·</span>
          <span>{timeAgo(tx.proposedAt)}</span>
        </div>
      </div>

      <div className="hidden text-right sm:block">
        <div className="font-mono text-sm font-semibold">{formatToken(tx.amount, tx.token)}</div>
        {tx.status !== "executed" && tx.status !== "cancelled" && !tx.viaPolicy && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {approvals}/{safe.threshold} approvals
          </div>
        )}
      </div>

      <TxStatusBadge status={tx.status} className="hidden md:inline-flex" />

      <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
