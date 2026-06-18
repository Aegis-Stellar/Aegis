import { useCallback, useState } from "react"
import { useStore } from "@/hooks/useStore"
import { connectWallet, disconnectWallet } from "@/lib/store"

/**
 * Wallet hook wrapping @creit.tech/stellar-wallets-kit v2.
 *
 * In mock mode (default): simulates wallet connection for demo purposes.
 * In real mode: opens the wallet selection modal and connects a real wallet.
 *
 * Set VITE_USE_MOCK_WALLET=false in .env.local to enable real signing.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK_WALLET !== "false"
const MOCK_ADDRESS = "GAULT3RXVKP7BVSFKUC4RFPM3VEXAM5ZTLKQ6XWE7FYPL3M2N4D0WALT"

export function useWallet() {
  const { wallet } = useStore()
  const [connecting, setConnecting] = useState(false)
  const [signTransaction, setSignTransaction] = useState<
    ((xdr: string) => Promise<string>) | null
  >(null)

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 650))
        connectWallet(MOCK_ADDRESS)
        setSignTransaction(() => async (xdr: string) => {
          console.warn("[mock] signTransaction — not submitted to chain")
          return xdr
        })
      } else {
        // Stellar Wallets Kit v2 — static API
        const { StellarWalletsKit, Networks } = await import("@creit.tech/stellar-wallets-kit")
        const network =
          import.meta.env.VITE_STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET
        StellarWalletsKit.init({ network })
        const { address } = await StellarWalletsKit.authModal()
        connectWallet(address)
        setSignTransaction(() => async (xdr: string) => {
          const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, {
            networkPassphrase: network,
            address,
          })
          return signedTxXdr
        })
      }
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    if (!USE_MOCK) {
      const { StellarWalletsKit } = await import("@creit.tech/stellar-wallets-kit")
      await StellarWalletsKit.disconnect().catch(() => {})
    }
    disconnectWallet()
    setSignTransaction(null)
  }, [])

  return {
    address: wallet,
    isConnected: !!wallet,
    connecting,
    connect,
    disconnect,
    /** Pass to contract invocation helpers. Null when disconnected. */
    signTransaction,
    isMock: USE_MOCK,
  }
}
