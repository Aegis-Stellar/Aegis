import { useState, useRef, useEffect } from "react"
import { LogOut, Wallet, ChevronDown, Loader2 } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { Button } from "@/components/ui/button"
import { Identicon } from "@/components/ui/identicon"
import { AddressDisplay } from "@/components/ui/AddressDisplay"
import { shortenAddress } from "@/lib/format"

export function ConnectWallet() {
  const { address, isConnected, connecting, connect, disconnect } = useWallet()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  if (!isConnected) {
    return (
      <Button onClick={connect} disabled={connecting} size="sm" className="gap-2">
        {connecting ? <Loader2 className="size-4 animate-spin" /> : <Wallet className="size-4" />}
        {connecting ? "Connecting…" : "Connect wallet"}
      </Button>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 py-1.5 pl-1.5 pr-2.5 text-sm font-medium transition-colors hover:bg-secondary"
      >
        <Identicon address={address!} className="size-6" />
        <span className="font-mono text-xs">{shortenAddress(address!, 4)}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-popover p-3 shadow-xl">
          <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-2.5">
            <Identicon address={address!} className="size-9" />
            <div className="min-w-0">
              <div className="text-sm font-medium">Connected</div>
              <AddressDisplay address={address!} chars={5} />
            </div>
          </div>
          <button
            onClick={() => {
              disconnect()
              setOpen(false)
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
