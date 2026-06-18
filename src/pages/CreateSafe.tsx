import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2, ShieldCheck, Loader2 } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { createSafe } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface OwnerField {
  address: string
  label: string
}

export function CreateSafe() {
  const navigate = useNavigate()
  const { address: walletAddress, isMock } = useWallet()

  const [name, setName] = useState("")
  const [owners, setOwners] = useState<OwnerField[]>([
    { address: walletAddress ?? "", label: "You" },
    { address: "", label: "" },
  ])
  const [threshold, setThreshold] = useState(2)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addOwner = () => setOwners((prev) => [...prev, { address: "", label: "" }])

  const removeOwner = (i: number) => {
    setOwners((prev) => prev.filter((_, idx) => idx !== i))
    setThreshold((t) => Math.min(t, owners.length - 1))
  }

  const updateOwner = (i: number, field: keyof OwnerField, value: string) => {
    setOwners((prev) => prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o)))
  }

  const validOwners = owners.filter((o) => o.address.trim().length > 0)
  const canSubmit =
    name.trim().length > 0 &&
    validOwners.length >= 1 &&
    threshold >= 1 &&
    threshold <= validOwners.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setSubmitting(true)
    try {
      // In production: call contractCreateSafe and store the deployed contract ID
      // For now (mock + no deployed contract): create in local store
      const id = createSafe({
        name: name.trim(),
        owners: validOwners.map((o) => ({ address: o.address.trim(), label: o.label.trim() || undefined })),
        threshold,
      })
      navigate(`/app/safe/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create a safe</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Deploy a new multisig safe on Stellar{isMock ? " (demo mode)" : ""}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Safe name */}
        <Card>
          <CardHeader>
            <CardTitle>Safe details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label htmlFor="safe-name">Name</Label>
              <Input
                id="safe-name"
                placeholder="e.g. DAO Treasury"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Owners */}
        <Card>
          <CardHeader>
            <CardTitle>Owners</CardTitle>
            <CardDescription>
              Add Stellar addresses that will co-own this safe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {owners.map((owner, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1 space-y-1.5">
                  <Input
                    placeholder="Stellar address (G…)"
                    value={owner.address}
                    onChange={(e) => updateOwner(i, "address", e.target.value)}
                    className="font-mono text-xs"
                  />
                  <Input
                    placeholder="Label (optional)"
                    value={owner.label}
                    onChange={(e) => updateOwner(i, "label", e.target.value)}
                    className="text-xs"
                  />
                </div>
                {owners.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeOwner(i)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1 gap-2"
              onClick={addOwner}
            >
              <Plus className="size-3.5" />
              Add owner
            </Button>
          </CardContent>
        </Card>

        {/* Threshold */}
        <Card>
          <CardHeader>
            <CardTitle>Approval threshold</CardTitle>
            <CardDescription>
              How many owners must approve a transaction before it can be executed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={1}
                max={validOwners.length || 1}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-muted-foreground">
                of {validOwners.length} owner{validOwners.length !== 1 ? "s" : ""}
              </span>
              <ShieldCheck className="size-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full gap-2" disabled={!canSubmit || submitting} size="lg">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
          {submitting ? "Deploying safe…" : "Create safe"}
        </Button>
      </form>
    </div>
  )
}
