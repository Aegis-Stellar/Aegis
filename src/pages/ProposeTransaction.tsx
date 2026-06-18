import { useState } from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react"
import { useSafe } from "@/hooks/useSafe"
import { useWallet } from "@/hooks/useWallet"
import { proposeTransaction } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input, Label, Textarea } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { TokenSymbol } from "@/types/safe"

const TOKENS: TokenSymbol[] = ["XLM", "USDC", "AQUA", "yXLM"]

export function ProposeTransaction() {
  const { id } = useParams()
  const navigate = useNavigate()
  const safe = useSafe(id)
  const { address: walletAddress } = useWallet()

  const [to, setTo] = useState("")
  const [token, setToken] = useState<TokenSymbol>("USDC")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!safe) return null

  const balance = safe.balances.find((b) => b.token === token)
  const canSubmit =
    to.trim().length > 0 &&
    parseFloat(amount) > 0 &&
    walletAddress != null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit || !walletAddress) return
    setError(null)
    setSubmitting(true)
    try {
      // In production: call contractPropose with signTransaction
      const txId = proposeTransaction(
        safe.id,
        {
          to: to.trim(),
          token,
          amount: parseFloat(amount),
          description: description.trim() || undefined,
        },
        walletAddress,
      )
      navigate(`/app/safe/${id}/tx/${txId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to propose transaction")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link to={`/app/safe/${id}`}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Propose transaction</h1>
          <p className="text-sm text-muted-foreground">{safe.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Transfer details</CardTitle>
            <CardDescription>
              Requires {safe.threshold} of {safe.owners.length} approvals to execute.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipient */}
            <div className="space-y-1.5">
              <Label htmlFor="to">Recipient address</Label>
              <Input
                id="to"
                placeholder="G…"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="font-mono text-xs"
                required
              />
            </div>

            {/* Token + amount */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="token">Token</Label>
                <select
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value as TokenSymbol)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {TOKENS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="amount">
                  Amount
                  {balance && (
                    <span className="ml-2 font-normal text-muted-foreground">
                      (balance: {balance.amount.toLocaleString()} {token})
                    </span>
                  )}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea
                id="desc"
                placeholder="What is this payment for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full gap-2" disabled={!canSubmit || submitting} size="lg">
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUpRight className="size-4" />
          )}
          {submitting ? "Submitting…" : "Propose transaction"}
        </Button>
      </form>
    </div>
  )
}
