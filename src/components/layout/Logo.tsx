import { cn } from "@/lib/utils"

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} fill="none" aria-hidden="true">
      <path
        d="M16 2 4 9v14l12 7 12-7V9L16 2Z"
        className="fill-primary/15 stroke-primary"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.4" className="fill-primary" />
      <circle cx="16" cy="8.4" r="2" className="fill-primary/70" />
      <circle cx="22.6" cy="19.8" r="2" className="fill-primary/70" />
      <circle cx="9.4" cy="19.8" r="2" className="fill-primary/70" />
      <path d="M16 11.4v2.2M19 17.6l-1.9 1.1M13 17.6l1.9 1.1" className="stroke-primary" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-lg font-bold tracking-tight">Quorum</span>
    </span>
  )
}
