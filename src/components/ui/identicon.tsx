import { cn } from "@/lib/utils"

/** Deterministic gradient avatar derived from an address. */
export function Identicon({ address, className }: { address: string; className?: string }) {
  let hash = 0
  for (let i = 0; i < address.length; i++) hash = (hash * 31 + address.charCodeAt(i)) >>> 0
  const h1 = hash % 360
  const h2 = (h1 + 90 + (hash % 60)) % 360
  return (
    <div
      className={cn("rounded-full ring-1 ring-border/60 shrink-0", className)}
      style={{
        backgroundImage: `linear-gradient(135deg, oklch(0.7 0.12 ${h1}), oklch(0.55 0.13 ${h2}))`,
      }}
      aria-hidden="true"
    />
  )
}
