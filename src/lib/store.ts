import type { Address, Safe, SafeTransaction, SpendingPolicy, TokenSymbol } from "@/types/safe"
import { initialSafes } from "@/lib/mock-data"

/**
 * A tiny reactive in-memory store backed by useSyncExternalStore.
 * Stands in for live Stellar contract state — every mutation here would
 * map to a `useContract` call against the Aegis Soroban contract.
 */

interface State {
  safes: Safe[]
  wallet: Address | null
}

let state: State = {
  safes: initialSafes,
  wallet: null,
}

const listeners = new Set<() => void>()

function emit() {
  state = { ...state }
  listeners.forEach((l) => l())
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getState() {
  return state
}

const genId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`

function patchSafe(safeId: string, fn: (safe: Safe) => Safe) {
  state.safes = state.safes.map((s) => (s.id === safeId ? fn(s) : s))
}

// ---- Wallet ----
export function connectWallet(address: Address) {
  state.wallet = address
  emit()
}

export function disconnectWallet() {
  state.wallet = null
  emit()
}

// ---- Safes ----
export function createSafe(input: {
  name: string
  owners: { address: Address; label?: string }[]
  threshold: number
}): string {
  const id = genId("safe")
  const safe: Safe = {
    id,
    name: input.name,
    address: `CQRM${id.toUpperCase().replace(/-/g, "")}${"X".repeat(40)}`.slice(0, 56),
    threshold: input.threshold,
    owners: input.owners,
    balances: [{ token: "XLM", amount: 0, usdValue: 0 }],
    transactions: [],
    policies: [],
    createdAt: new Date().toISOString(),
  }
  state.safes = [safe, ...state.safes]
  emit()
  return id
}

// ---- Transactions ----
export function proposeTransaction(
  safeId: string,
  input: { to: Address; token: TokenSymbol; amount: number; description?: string; data?: string },
  proposer: Address,
): string {
  const id = genId("tx")
  patchSafe(safeId, (safe) => {
    const nonce = Math.max(0, ...safe.transactions.map((t) => t.nonce)) + 1
    const tx: SafeTransaction = {
      id,
      safeId,
      nonce,
      to: input.to,
      token: input.token,
      amount: input.amount,
      description: input.description,
      data: input.data,
      status: safe.threshold <= 1 ? "ready" : "pending",
      proposedBy: proposer,
      proposedAt: new Date().toISOString(),
      approvals: [{ owner: proposer, approvedAt: new Date().toISOString() }],
    }
    return { ...safe, transactions: [tx, ...safe.transactions] }
  })
  emit()
  return id
}

function recompute(safe: Safe, tx: SafeTransaction): SafeTransaction {
  if (tx.status === "executed" || tx.status === "cancelled") return tx
  const status = tx.approvals.length >= safe.threshold ? "ready" : "pending"
  return { ...tx, status }
}

export function approveTransaction(safeId: string, txId: string, owner: Address) {
  patchSafe(safeId, (safe) => ({
    ...safe,
    transactions: safe.transactions.map((tx) => {
      if (tx.id !== txId) return tx
      if (tx.approvals.some((a) => a.owner === owner)) return tx
      const next = { ...tx, approvals: [...tx.approvals, { owner, approvedAt: new Date().toISOString() }] }
      return recompute(safe, next)
    }),
  }))
  emit()
}

export function revokeApproval(safeId: string, txId: string, owner: Address) {
  patchSafe(safeId, (safe) => ({
    ...safe,
    transactions: safe.transactions.map((tx) => {
      if (tx.id !== txId) return tx
      const next = { ...tx, approvals: tx.approvals.filter((a) => a.owner !== owner) }
      return recompute(safe, next)
    }),
  }))
  emit()
}

export function executeTransaction(safeId: string, txId: string, executor: Address) {
  patchSafe(safeId, (safe) => {
    const tx = safe.transactions.find((t) => t.id === txId)
    if (!tx) return safe
    const transactions = safe.transactions.map((t) =>
      t.id === txId
        ? { ...t, status: "executed" as const, executedAt: new Date().toISOString(), executedBy: executor }
        : t,
    )
    // deduct balance
    const balances = safe.balances.map((b) =>
      b.token === tx.token
        ? { ...b, amount: Math.max(0, b.amount - tx.amount), usdValue: Math.max(0, b.usdValue - tx.amount * (b.usdValue / (b.amount || 1))) }
        : b,
    )
    return { ...safe, transactions, balances }
  })
  emit()
}

export function cancelTransaction(safeId: string, txId: string) {
  patchSafe(safeId, (safe) => ({
    ...safe,
    transactions: safe.transactions.map((t) =>
      t.id === txId ? { ...t, status: "cancelled" as const } : t,
    ),
  }))
  emit()
}

// ---- Owners & threshold ----
export function addOwner(safeId: string, address: Address, label?: string) {
  patchSafe(safeId, (safe) =>
    safe.owners.some((o) => o.address === address)
      ? safe
      : { ...safe, owners: [...safe.owners, { address, label }] },
  )
  emit()
}

export function removeOwner(safeId: string, address: Address) {
  patchSafe(safeId, (safe) => {
    const owners = safe.owners.filter((o) => o.address !== address)
    const threshold = Math.min(safe.threshold, owners.length)
    return { ...safe, owners, threshold }
  })
  emit()
}

export function setThreshold(safeId: string, threshold: number) {
  patchSafe(safeId, (safe) => ({ ...safe, threshold }))
  emit()
}

// ---- Spending policies ----
export function addPolicy(safeId: string, input: Omit<SpendingPolicy, "id" | "safeId" | "spent">) {
  patchSafe(safeId, (safe) => ({
    ...safe,
    policies: [...safe.policies, { ...input, id: genId("pol"), safeId, spent: 0 }],
  }))
  emit()
}

export function togglePolicy(safeId: string, policyId: string) {
  patchSafe(safeId, (safe) => ({
    ...safe,
    policies: safe.policies.map((p) => (p.id === policyId ? { ...p, enabled: !p.enabled } : p)),
  }))
  emit()
}

export function removePolicy(safeId: string, policyId: string) {
  patchSafe(safeId, (safe) => ({
    ...safe,
    policies: safe.policies.filter((p) => p.id !== policyId),
  }))
  emit()
}
