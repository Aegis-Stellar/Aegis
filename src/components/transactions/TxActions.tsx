import { useState } from "react"
import { Check, Loader2, X, Zap, Undo2 } from "lucide-react"
import type { Safe, SafeTransaction } from "@/types/safe"
import { Button } from "@/components/ui/button"
import {
  approveTransaction,
  cancelTransaction,
  executeTransaction,
  revokeApproval,
} from "@/lib/store"

interface ActionProps {
  safe: Safe
  tx: SafeTransaction
  currentUser: string
}

function useAction() {
  const [pending, setPending] = useState(false)
  const run = async (fn: () => void) => {
    setPending(true)
    await new Promise((r) => setTimeout(r, 600))
    fn()
    setPending(false)
  }
  return { pending, run }
}

export function ApproveButton({ safe, tx, currentUser }: ActionProps) {
  const { pending, run } = useAction()
  const hasApproved = tx.approvals.some((a) => a.owner === currentUser)

  if (hasApproved) {
    return (
      <Button
        variant="outline"
        className="w-full gap-2"
        disabled={pending}
        onClick={() => run(() => revokeApproval(safe.id, tx.id, currentUser))}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Undo2 className="size-4" />}
        Revoke approval
      </Button>
    )
  }

  return (
    <Button
      className="w-full gap-2"
      disabled={pending}
      onClick={() => run(() => approveTransaction(safe.id, tx.id, currentUser))}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
      Approve
    </Button>
  )
}

export function ExecuteButton({ safe, tx, currentUser }: ActionProps) {
  const { pending, run } = useAction()
  const ready = tx.approvals.length >= safe.threshold
  return (
    <Button
      className="w-full gap-2"
      disabled={pending || !ready}
      onClick={() => run(() => executeTransaction(safe.id, tx.id, currentUser))}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
      Execute transaction
    </Button>
  )
}

export function CancelButton({ safe, tx }: ActionProps) {
  const { pending, run } = useAction()
  return (
    <Button
      variant="ghost"
      className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={pending}
      onClick={() => run(() => cancelTransaction(safe.id, tx.id))}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
      Cancel transaction
    </Button>
  )
}
