import { Wallet, Loader2 } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { Button } from "@/components/ui/button"

/** Wraps app content; prompts a (mock) wallet connection when not connected. */
export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected, connecting, connect } = useWallet()

  if (isConnected) return <>{children}</>

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-xl bg-primary/15">
          <Wallet className="size-7 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">Connect your wallet</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Connect a Stellar wallet to view your safes, approve transactions, and manage owners.
        </p>
        <Button onClick={connect} disabled={connecting} className="mt-6 w-full gap-2" size="lg">
          {connecting ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
          {connecting ? "Connecting…" : "Connect wallet"}
        </Button>
        <p className="mt-3 text-xs text-muted-foreground">
          Freighter · xBull · Albedo · Lobstr — via Stellar Wallets Kit
        </p>
      </div>
    </div>
  )
}
