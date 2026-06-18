import type { TokenSymbol } from "@/types/safe"

export function shortenAddress(address: string, chars = 4) {
  if (!address) return ""
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars + 1)}…${address.slice(-chars)}`
}

export function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  }).format(value)
}

export function formatToken(amount: number, token?: TokenSymbol) {
  const n = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
  return token ? `${n} ${token}` : n
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value)
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const future = diff < 0
  const abs = Math.abs(diff)
  const mins = Math.round(abs / 60000)
  const hours = Math.round(abs / 3600000)
  const days = Math.round(abs / 86400000)
  let label: string
  if (mins < 1) label = "just now"
  else if (mins < 60) label = `${mins}m`
  else if (hours < 24) label = `${hours}h`
  else if (days < 30) label = `${days}d`
  else label = `${Math.round(days / 30)}mo`
  if (label === "just now") return label
  return future ? `in ${label}` : `${label} ago`
}

export const tokenMeta: Record<TokenSymbol, { name: string; color: string }> = {
  XLM: { name: "Stellar Lumens", color: "oklch(0.78 0.13 230)" },
  USDC: { name: "USD Coin", color: "oklch(0.7 0.13 240)" },
  AQUA: { name: "Aquarius", color: "oklch(0.7 0.16 200)" },
  yXLM: { name: "Yield XLM", color: "oklch(0.78 0.15 150)" },
}
