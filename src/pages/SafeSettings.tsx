import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Plus, Trash2, ShieldCheck, Loader2, GaugeCircle } from "lucide-react"
import { useSafe } from "@/hooks/useSafe"
import { useWallet } from "@/hooks/useWallet"
import { addOwner, removeOwner, setThreshold, addPolicy, togglePolicy, removePolicy } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { OwnerBadge } from "@/components/safe/OwnerBadge"
import { Badge } from "@/components/ui/badge"
import { formatToken, timeAgo } from "@/lib/format"
import type { TokenSymbol, PolicyPeriod } from "@/types/safe"

const TOKENS: TokenSymbol[] = ["XLM", "USDC", "AQUA", "yXLM"]
const PERIODS: PolicyPeriod[] = ["daily", "weekly", "monthly"]

function useAction() {
  const [pending, setPending] = useState(false)
  const run = async (fn: () => void) => {
    setPending(true)
    await new Promise((r) => setTimeout(r, 500))
    fn()
    setPending(false)
  }
  return { pending, run }
}

export function SafeSettings() {
  const { id } = useParams()
  const safe = useSafe(id)
  const { address: walletAddress } = useWallet()

  const [newOwnerAddress, setNewOwnerAddress] = useState("")
  const [newOwnerLabel, setNewOwnerLabel] = useState("")
  const [newThreshold, setNewThreshold] = useState(safe?.threshold ?? 1)

  const [polBeneficiary, setPolBeneficiary] = useState("")
  const [polToken, setPolToken] = useState<TokenSymbol>("USDC")
  const [polLimit, setPolLimit] = useState("")
  const [polPeriod, setPolPeriod] = useState<PolicyPeriod>("monthly")

  const addOwnerAction = useAction()
  const thresholdAction = useAction()
  const policyAction = useAction()

  if (!safe) return null

  const isOwner = safe.owners.some((o) => o.address === walletAddress)

  const handleAddOwner = () => {
    if (!newOwnerAddress.trim() || !walletAddress) return
    addOwnerAction.run(() => {
      addOwner(safe.id, newOwnerAddress.trim(), newOwnerLabel.trim() || undefined)
      setNewOwnerAddress("")
      setNewOwnerLabel("")
    })
  }

  const handleSetThreshold = () => {
    thresholdAction.run(() => setThreshold(safe.id, newThreshold))
  }

  const handleAddPolicy = () => {
    if (!polBeneficiary.trim() || !parseFloat(polLimit)) return
    policyAction.run(() => {
      addPolicy(safe.id, {
        beneficiary: polBeneficiary.trim(),
        token: polToken,
        limit: parseFloat(polLimit),
        period: polPeriod,
        resetsAt: new Date(Date.now() + periodMs(polPeriod)).toISOString(),
        enabled: true,
      })
      setPolBeneficiary("")
      setPolLimit("")
    })
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link to={`/app/safe/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">{safe.name}</p>
        </div>
      </div>

      {!isOwner && (
        <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          You are not an owner of this safe. Settings are read-only.
        </p>
      )}

      {/* Owners */}
      <Card>
        <CardHeader>
          <CardTitle>Owners</CardTitle>
          <CardDescription>
            {safe.owners.length} owner{safe.owners.length !== 1 ? "s" : ""} · {safe.threshold}-of-{safe.owners.length} threshold
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {safe.owners.map((owner) => (
            <div key={owner.address} className="flex items-center gap-2">
              <OwnerBadge
                owner={owner}
                isCurrentUser={owner.address === walletAddress}
                className="flex-1"
              />
              {isOwner && safe.owners.length > 1 && owner.address !== walletAddress && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeOwner(safe.id, owner.address)}
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          ))}

          {isOwner && (
            <div className="mt-2 space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Add owner</p>
              <Input
                placeholder="Stellar address (G…)"
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                className="font-mono text-xs"
              />
              <Input
                placeholder="Label (optional)"
                value={newOwnerLabel}
                onChange={(e) => setNewOwnerLabel(e.target.value)}
                className="text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={!newOwnerAddress.trim() || addOwnerAction.pending}
                onClick={handleAddOwner}
              >
                {addOwnerAction.pending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                Add owner
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threshold */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Approval threshold</CardTitle>
            <CardDescription>
              Minimum number of owners required to execute a transaction.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-end gap-3">
            <div className="space-y-1.5">
              <Label>Required approvals</Label>
              <Input
                type="number"
                min={1}
                max={safe.owners.length}
                value={newThreshold}
                onChange={(e) => setNewThreshold(Number(e.target.value))}
                className="w-20"
              />
            </div>
            <span className="pb-2.5 text-sm text-muted-foreground">of {safe.owners.length}</span>
            <Button
              size="sm"
              className="gap-2"
              disabled={newThreshold === safe.threshold || thresholdAction.pending}
              onClick={handleSetThreshold}
            >
              {thresholdAction.pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="size-3.5" />
              )}
              Update
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Spending policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GaugeCircle className="size-4 text-primary" />
            Spending policies
          </CardTitle>
          <CardDescription>
            Per-owner recurring allowances that bypass the multisig threshold.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {safe.policies.length === 0 && (
            <p className="text-sm text-muted-foreground">No policies configured.</p>
          )}
          {safe.policies.map((pol) => {
            const pct = Math.min(100, (pol.spent / pol.limit) * 100)
            const owner = safe.owners.find((o) => o.address === pol.beneficiary)
            return (
              <div key={pol.id} className="rounded-lg border border-border bg-background/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {owner?.label || pol.beneficiary.slice(0, 10) + "…"}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant={pol.enabled ? "success" : "muted"}>
                      {pol.enabled ? "Active" : "Paused"}
                    </Badge>
                    {isOwner && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => togglePolicy(safe.id, pol.id)}
                        >
                          {pol.enabled ? "Pause" : "Resume"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removePolicy(safe.id, pol.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">
                    {formatToken(pol.spent)} / {formatToken(pol.limit)} {pol.token}
                  </span>
                  <span className="capitalize">{pol.period} · resets {timeAgo(pol.resetsAt)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 100 ? "var(--warning)" : "var(--primary)",
                    }}
                  />
                </div>
              </div>
            )
          })}

          {isOwner && (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">New policy</p>
              <Input
                placeholder="Beneficiary address (G…)"
                value={polBeneficiary}
                onChange={(e) => setPolBeneficiary(e.target.value)}
                className="font-mono text-xs"
              />
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={polToken}
                  onChange={(e) => setPolToken(e.target.value as TokenSymbol)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {TOKENS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <Input
                  type="number"
                  placeholder="Limit"
                  value={polLimit}
                  onChange={(e) => setPolLimit(e.target.value)}
                />
                <select
                  value={polPeriod}
                  onChange={(e) => setPolPeriod(e.target.value as PolicyPeriod)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {PERIODS.map((p) => <option key={p} className="capitalize">{p}</option>)}
                </select>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                disabled={!polBeneficiary.trim() || !parseFloat(polLimit) || policyAction.pending}
                onClick={handleAddPolicy}
              >
                {policyAction.pending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                Add policy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function periodMs(p: PolicyPeriod): number {
  return p === "daily" ? 86400000 : p === "weekly" ? 604800000 : 2592000000
}
