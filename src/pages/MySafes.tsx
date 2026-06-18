import { Link } from "react-router-dom"
import { Plus, ShieldOff } from "lucide-react"
import { useMySafes } from "@/hooks/useSafe"
import { SafeCard } from "@/components/safe/SafeCard"
import { Button } from "@/components/ui/button"

export function MySafes() {
  const safes = useMySafes()

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your safes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {safes.length} safe{safes.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Button asChild size="sm" className="gap-2">
          <Link to="/app/create">
            <Plus className="size-4" />
            New safe
          </Link>
        </Button>
      </div>

      {safes.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-secondary">
            <ShieldOff className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium">No safes yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first multisig safe to get started.
          </p>
          <Button asChild className="mt-2 gap-2">
            <Link to="/app/create">
              <Plus className="size-4" />
              Create a safe
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {safes.map((safe) => (
            <SafeCard key={safe.id} safe={safe} />
          ))}
        </div>
      )}
    </div>
  )
}
