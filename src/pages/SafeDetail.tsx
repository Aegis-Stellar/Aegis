import { Link, useParams } from "react-router-dom"
import { ArrowUpRight, Plus, Settings, GaugeCircle, Clock } from "lucide-react"
import { useSafe } from "@/hooks/useSafe"
import { useWallet } from "@/hooks/useWallet"
import { TransactionCard } from "@/components/transactions/TransactionCard"
import { OwnerBadge } from "@/components/safe/OwnerBadge"
import { ThresholdBadge } from "@/components/ui/ThresholdBadge"
import { AddressDisplay } from "@/components/ui/AddressDisplay"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Identicon } from "@/components/ui/identicon"
import { formatUsd, formatToken, timeAgo } from "@/lib/format"

export function SafeDetail() {
  const { id } = useParams()
  const safe = useSafe(id)
  const { address: walletAddress } = useWallet()

  if (!safe) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Safe not found.
      </div>
    )
  }

  const totalUsd = safe.balances.reduce((s, b) => s + b.usdValue, 0)
  const activeTxs = safe.transactions.filter(
    (t) => t.status === "pending" || t.status === "ready",
  )
  const historicTxs = safe.transactions.filter(
    (t) => t.status === "executed" || t.status === "cancelled",
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <Identicon address={safe.address} className="size-12" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{safe.name}</h1>
            <AddressDisplay address={safe.address} chars={6} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to={`/app/safe/${id}/settings`}>
              <Settings className="size-4" />
              Settings
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link to={`/app/safe/${id}/propose`}>
              <Plus className="size-4" />
              New transaction
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Total balance</div>
            <div className="mt-1 text-2xl font-bold">{formatUsd(totalUsd)}</div>
            <div className="mt-2 space-y-0.5">
              {safe.balances.map((b) => (
                <div key={b.token} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{b.token}</span>
                  <span className="font-mono">{formatToken(b.amount)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Owners</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-bold">{safe.owners.length}</span>
              <ThresholdBadge threshold={safe.threshold} total={safe.owners.length} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-muted-foreground">Pending transactions</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-bold">{activeTxs.length}</span>
              {activeTxs.length > 0 && (
                <Badge variant="warning">
                  <Clock className="size-3" />
                  Active
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active transactions */}
      {activeTxs.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Needs attention
          </h2>
          <div className="space-y-2">
            {activeTxs.map((tx) => (
              <TransactionCard key={tx.id} safe={safe} tx={tx} />
            ))}
          </div>
        </section>
      )}

      {/* Owners */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Owners</h2>
          <ThresholdBadge threshold={safe.threshold} total={safe.owners.length} />
        </div>
        <div className="space-y-2">
          {safe.owners.map((owner) => (
            <OwnerBadge
              key={owner.address}
              owner={owner}
              isCurrentUser={owner.address === walletAddress}
            />
          ))}
        </div>
      </section>

      {/* Spending policies */}
      {safe.policies.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Spending policies
            </h2>
            <GaugeCircle className="size-4 text-primary" />
          </div>
          <div className="space-y-2">
            {safe.policies.map((pol) => {
              const pct = Math.min(100, (pol.spent / pol.limit) * 100)
              const owner = safe.owners.find((o) => o.address === pol.beneficiary)
              return (
                <div
                  key={pol.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{owner?.label || pol.beneficiary.slice(0, 8) + "…"}</span>
                    <Badge variant={pol.enabled ? "success" : "muted"}>
                      {pol.enabled ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">
                      {formatToken(pol.spent)} / {formatToken(pol.limit)} {pol.token}
                    </span>
                    <span className="capitalize">{pol.period} · resets {timeAgo(pol.resetsAt)}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: pct >= 100 ? "var(--warning)" : "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Transaction history */}
      {historicTxs.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            History
          </h2>
          <div className="space-y-2">
            {historicTxs.map((tx) => (
              <TransactionCard key={tx.id} safe={safe} tx={tx} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
