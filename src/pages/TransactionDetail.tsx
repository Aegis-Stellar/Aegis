import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Zap } from "lucide-react"
import { useSafe, useTransaction } from "@/hooks/useSafe"
import { useWallet } from "@/hooks/useWallet"
import { ApprovalTracker } from "@/components/transactions/ApprovalTracker"
import { ApproveButton, ExecuteButton, CancelButton } from "@/components/transactions/TxActions"
import { TxStatusBadge } from "@/components/transactions/TxStatusBadge"
import { AddressDisplay } from "@/components/ui/AddressDisplay"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatToken, formatUsd, timeAgo } from "@/lib/format"

export function TransactionDetail() {
  const { id, txId } = useParams()
  const safe = useSafe(id)
  const tx = useTransaction(id, txId)
  const { address: walletAddress } = useWallet()

  if (!safe || !tx) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        Transaction not found.
      </div>
    )
  }

  const isOwner = safe.owners.some((o) => o.address === walletAddress)
  const isActive = tx.status === "pending" || tx.status === "ready"
  const balance = safe.balances.find((b) => b.token === tx.token)
  const usdValue = balance && balance.amount > 0
    ? (tx.amount / balance.amount) * balance.usdValue
    : 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link to={`/app/safe/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">#{tx.nonce}</span>
          <TxStatusBadge status={tx.status} />
          {tx.viaPolicy && (
            <Badge>
              <Zap className="size-3" /> Policy
            </Badge>
          )}
        </div>
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {tx.description || "Transfer"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <div className="text-right">
              <div className="font-mono font-semibold">{formatToken(tx.amount, tx.token)}</div>
              {usdValue > 0 && (
                <div className="text-xs text-muted-foreground">{formatUsd(usdValue)}</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">To</span>
            <AddressDisplay address={tx.to} chars={6} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Proposed by</span>
            <AddressDisplay
              address={tx.proposedBy}
              chars={5}
              label={safe.owners.find((o) => o.address === tx.proposedBy)?.label}
              showCopy={false}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Proposed</span>
            <span className="text-sm">{timeAgo(tx.proposedAt)}</span>
          </div>

          {tx.executedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Executed</span>
              <span className="text-sm">{timeAgo(tx.executedAt)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval tracker */}
      {!tx.viaPolicy && (
        <Card>
          <CardContent className="p-5">
            <ApprovalTracker safe={safe} tx={tx} currentUser={walletAddress} />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {isOwner && isActive && walletAddress && (
        <Card>
          <CardContent className="space-y-2 p-5">
            <ApproveButton safe={safe} tx={tx} currentUser={walletAddress} />
            {tx.status === "ready" && (
              <ExecuteButton safe={safe} tx={tx} currentUser={walletAddress} />
            )}
            <CancelButton safe={safe} tx={tx} currentUser={walletAddress} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
