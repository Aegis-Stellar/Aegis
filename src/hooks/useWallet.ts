import { useCallback, useState } from "react"
import { useStore } from "@/hooks/useStore"
import { connectWallet, disconnectWallet } from "@/lib/store"
import { CURRENT_USER } from "@/lib/mock-data"

/**
 * Mocked wallet hook. In production this wraps @creit.tech/stellar-wallets-kit
 * (Freighter, xBull, Albedo, etc). The connect flow is simulated with a short delay.
 */
export function useWallet() {
  const { wallet } = useStore()
  const [connecting, setConnecting] = useState(false)

  const connect = useCallback(async () => {
    setConnecting(true)
    await new Promise((r) => setTimeout(r, 650))
    connectWallet(CURRENT_USER)
    setConnecting(false)
  }, [])

  const disconnect = useCallback(() => disconnectWallet(), [])

  return {
    address: wallet,
    isConnected: !!wallet,
    connecting,
    connect,
    disconnect,
  }
}
