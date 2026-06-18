import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { shortenAddress } from "@/lib/format"

interface AddressDisplayProps {
  address: string
  chars?: number
  className?: string
  /** when set, render this label and show the address as a subtle subtitle */
  label?: string
  showCopy?: boolean
}

export function AddressDisplay({ address, chars = 4, className, label, showCopy = true }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <div className="min-w-0">
        {label && <div className="truncate text-sm font-medium leading-tight">{label}</div>}
        <span className={cn("font-mono text-muted-foreground", label ? "text-xs" : "text-sm")}>
          {shortenAddress(address, chars)}
        </span>
      </div>
      {showCopy && (
        <button
          type="button"
          onClick={copy}
          className="text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Copy address"
        >
          {copied ? <Check className="size-3.5 text-[var(--success)]" /> : <Copy className="size-3.5" />}
        </button>
      )}
    </div>
  )
}
