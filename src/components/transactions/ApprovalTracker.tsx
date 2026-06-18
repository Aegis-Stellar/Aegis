import type { Safe, SafeTransaction } from "@/types/safe"
import { OwnerBadge } from "@/components/safe/OwnerBadge"
import { timeAgo } from "@/lib/format"

interface ApprovalTrackerProps {
  safe: Safe
  tx: SafeTransaction
  currentUser?: string | null
}

/**
 * Shows exactly who has approved and who hasn't — the governance-transparency
 * feature at the heart of Quorum.
 */
export function ApprovalTracker({ safe, tx, currentUser }: ApprovalTrackerProps) {
  const approvedCount = tx.approvals.length
  const remaining = Math.max(0, safe.threshold - approvedCount)
  const pct = Math.min(100, (approvedCount / safe.threshold) * 100)

  const approvalFor = (address: string) => tx.approvals.find((a) => a.owner === address)

  // approved owners first, then pending
  const ordered = [...safe.owners].sort((a, b) => {
    const aa = approvalFor(a.address) ? 1 : 0
    const bb = approvalFor(b.address) ? 1 : 0
    return bb - aa
  })

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-sm font-medium">Approvals</div>
          <div className="text-xs text-muted-foreground">
            {remaining > 0
              ? `${remaining} more ${remaining === 1 ? "approval" : "approvals"} needed to execute`
              : "Threshold reached — ready to execute"}
          </div>
        </div>
        <div className="font-mono text-sm">
          <span className="font-semibold">{approvedCount}</span>
          <span className="text-muted-foreground"> / {safe.threshold}</span>
        </div>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {ordered.map((owner) => {
          const approval = approvalFor(owner.address)
          return (
            <OwnerBadge
              key={owner.address}
              owner={owner}
              isCurrentUser={owner.address === currentUser}
              approved={!!approval}
              meta={approval ? timeAgo(approval.approvedAt) : undefined}
            />
          )
        })}
      </div>
    </div>
  )
}
