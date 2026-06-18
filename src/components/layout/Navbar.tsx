import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/layout/Logo"
import { ConnectWallet } from "@/components/layout/ConnectWallet"

const navItems = [
  { to: "/app/safes", label: "Safes" },
  { to: "/app/create", label: "Create safe" },
]

export function Navbar({ variant = "app" }: { variant?: "app" | "landing" }) {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="transition-opacity hover:opacity-80">
            <Logo />
          </Link>
          {variant === "app" && (
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {variant === "landing" && (
            <Link
              to="/app/safes"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Open app
            </Link>
          )}
          <ConnectWallet />
        </div>
      </div>
    </header>
  )
}
