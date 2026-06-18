import { useStore } from "@/hooks/useStore"

export function useSafe(id: string | undefined) {
  const { safes } = useStore()
  return safes.find((s) => s.id === id)
}

export function useMySafes() {
  const { safes, wallet } = useStore()
  if (!wallet) return safes
  return safes.filter((s) => s.owners.some((o) => o.address === wallet))
}

export function useTransaction(safeId: string | undefined, txId: string | undefined) {
  const safe = useSafe(safeId)
  return safe?.transactions.find((t) => t.id === txId)
}
