export type Address = string

export type TokenSymbol = "XLM" | "USDC" | "AQUA" | "yXLM"

export type TxStatus = "pending" | "ready" | "executed" | "cancelled"

export interface Owner {
  address: Address
  label?: string
}

export interface TokenBalance {
  token: TokenSymbol
  amount: number
  usdValue: number
}

export interface Approval {
  owner: Address
  approvedAt: string
}

export interface SafeTransaction {
  id: string
  safeId: string
  nonce: number
  to: Address
  token: TokenSymbol
  amount: number
  description?: string
  data?: string
  status: TxStatus
  proposedBy: Address
  proposedAt: string
  approvals: Approval[]
  executedAt?: string
  executedBy?: Address
  viaPolicy?: boolean
}

export type PolicyPeriod = "daily" | "weekly" | "monthly"

export interface SpendingPolicy {
  id: string
  safeId: string
  beneficiary: Address
  token: TokenSymbol
  limit: number
  spent: number
  period: PolicyPeriod
  resetsAt: string
  enabled: boolean
}

export interface Safe {
  id: string
  name: string
  address: Address
  threshold: number
  owners: Owner[]
  balances: TokenBalance[]
  transactions: SafeTransaction[]
  policies: SpendingPolicy[]
  createdAt: string
}
