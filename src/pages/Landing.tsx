import { Link } from "react-router-dom"
import {
  ArrowRight,
  ShieldCheck,
  Users,
  GaugeCircle,
  Eye,
  Check,
  Clock,
  Wallet,
  GitBranch,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/layout/Logo"

export function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-backdrop absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 gap-2 py-1">
              <span className="inline-block size-1.5 rounded-full bg-primary" />
              Native multisig for the Stellar network
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              Treasury security with{" "}
              <span className="text-primary">governance transparency</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Quorum is a multisig safe for DAOs and teams on Stellar. Set thresholds,
              see exactly who approved every move, and grant native spending policies
              without weakening your treasury.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link to="/app/create">
                  Create a safe
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/app/safes">View your safes</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="size-3.5 text-primary" /> Non-custodial
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GaugeCircle className="size-3.5 text-primary" /> Sub-cent fees
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" /> Soroban smart contract
              </span>
            </div>
          </div>

          {/* Hero preview card */}
          <div className="mx-auto mt-16 max-w-3xl">
            <ApprovalPreview />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-4 sm:px-6 md:grid-cols-4">
          {[
            { label: "Assets secured", value: "$48.2M" },
            { label: "Active safes", value: "1,240" },
            { label: "Transactions signed", value: "86k+" },
            { label: "Avg. fee per tx", value: "$0.004" },
          ].map((s, i) => (
            <div key={s.label} className={i === 0 ? "py-8 pr-6 first:pl-0" : "py-8 px-6"}>
              <div className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            Everything a treasury needs, nothing it doesn&apos;t
          </h2>
          <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
            Configurable approval thresholds, transparent governance, and native
            spending allowances — built directly into the contract.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <FeatureCard
            icon={Eye}
            title="Approval transparency"
            body="Every transaction shows exactly who has approved and who hasn't — the accountability DAOs need for on-chain governance."
            highlight
          />
          <FeatureCard
            icon={GaugeCircle}
            title="Native spending policies"
            body="Grant a contributor a monthly allowance executable as single-signer transactions, without lowering the treasury threshold."
            highlight
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Configurable thresholds"
            body="Require M of N owners for any move. Change owners and thresholds with the same multisig guarantees."
          />
          <FeatureCard
            icon={Users}
            title="Owner management"
            body="Add or remove signers with labeled, human-readable identities. No more guessing who G…WALT is."
          />
          <FeatureCard
            icon={GitBranch}
            title="Proposal queue"
            body="Queue transactions, collect approvals over time, and execute the moment your threshold is reached."
          />
          <FeatureCard
            icon={Wallet}
            title="Any Stellar wallet"
            body="Connect Freighter, xBull, Albedo, or Lobstr through the Stellar Wallets Kit. No new accounts."
          />
        </div>
      </section>

      {/* Spending policy spotlight */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2">
          <div>
            <Badge className="mb-4">What sets Quorum apart</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Allowances that don&apos;t compromise the threshold
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Operations move fast; treasuries shouldn&apos;t. Quorum lets a DAO grant a
              contributor a recurring allowance they can spend as a single signer — while
              treasury-level moves still require the full multisig. It&apos;s built natively
              into the core contract, not bolted on as a module.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Per-owner daily, weekly, or monthly limits",
                "Auto-resetting periods tracked on-chain",
                "Revoke or pause any allowance instantly",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/15">
                    <Check className="size-3 text-primary" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 gap-2">
              <Link to="/app/create">
                Set up a safe
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <PolicyPreview />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-4xl">
          Secure your DAO&apos;s treasury in minutes
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-muted-foreground leading-relaxed">
          Deploy a multisig safe on Stellar, add your owners, and start moving funds
          with confidence.
        </p>
        <Button asChild size="lg" className="mt-8 gap-2">
          <Link to="/app/create">
            Create your first safe
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <Logo />
          <p className="text-xs text-muted-foreground">
            Built on Stellar · Soroban smart contracts · Non-custodial
          </p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Quorum</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  body: string
  highlight?: boolean
}) {
  return (
    <div
      className={
        "rounded-xl border p-6 transition-colors " +
        (highlight ? "border-primary/30 bg-primary/[0.04]" : "border-border bg-card")
      }
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/15">
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  )
}

function ApprovalPreview() {
  const owners = [
    { label: "Priya — Core", approved: true },
    { label: "You", approved: true },
    { label: "Marcus — Ops", approved: false },
    { label: "Elena — Legal", approved: false },
  ]
  const approved = owners.filter((o) => o.approved).length
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-muted-foreground">Pending transaction · #42</div>
          <div className="mt-1 font-semibold">Q3 grants disbursement</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-semibold">45,000 USDC</div>
          <Badge variant="warning" className="mt-1">
            <Clock className="size-3" /> Awaiting approvals
          </Badge>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Approvals</span>
        <span>
          {approved} of 3 required
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(approved / 3) * 100}%` }} />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {owners.map((o) => (
          <div
            key={o.label}
            className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-3 py-2"
          >
            <span className="text-sm">{o.label}</span>
            {o.approved ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--success)]">
                <Check className="size-3.5" /> Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> Pending
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PolicyPreview() {
  const policies = [
    { who: "Marcus — Ops", token: "USDC", spent: 1850, limit: 5000, period: "monthly" },
    { who: "Dax — Eng", token: "XLM", spent: 20000, limit: 20000, period: "monthly" },
  ]
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium">
        <GaugeCircle className="size-4 text-primary" />
        Active spending policies
      </div>
      <div className="space-y-3">
        {policies.map((p) => {
          const pct = Math.min(100, (p.spent / p.limit) * 100)
          const maxed = pct >= 100
          return (
            <div key={p.who} className="rounded-lg border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{p.who}</span>
                <Badge variant={maxed ? "muted" : "success"}>
                  {maxed ? "Limit reached" : "Active"}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-mono">
                  {p.spent.toLocaleString()} / {p.limit.toLocaleString()} {p.token}
                </span>
                <span className="capitalize">{p.period}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: maxed ? "var(--warning)" : "var(--primary)" }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
