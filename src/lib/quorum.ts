/**
 * Aegis contract integration layer.
 *
 * Uses the auto-generated typed client from:
 *   stellar contract bindings typescript --contract-id CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC
 *
 * Contract on testnet:
 *   https://lab.stellar.org/r/testnet/contract/CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC
 */

import { Client, networks } from "@/contracts/quorum/src/index"
import type { Owner as ContractOwner, Period } from "@/contracts/quorum/src/index"
import type { Owner, TokenSymbol } from "@/types/safe"

export { networks }

export const QUORUM_CONTRACT_ID = "CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC"
export const STELLAR_NETWORK = (import.meta.env.VITE_STELLAR_NETWORK ?? "testnet") as "testnet" | "mainnet"

export const RPC_URL =
  STELLAR_NETWORK === "mainnet"
    ? "https://mainnet.stellar.validationcloud.io/v1/soroban"
    : "https://soroban-testnet.stellar.org"

// ── Token SAC addresses (testnet) ────────────────────────────────────────────
export const TOKEN_ADDRESSES: Record<TokenSymbol, string> = {
  XLM: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  USDC: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  AQUA: "CAUIKL3IYGMERDRUN5TICFDGE5Z7XFXD7DYK6YOAIGFLEYO4IFVDTNO",
  yXLM: "CDHD2MWNQYGSIFKH2RBXRJZ33JXWSF3WSTSBFJ5D4KPCPKXMQDABTG4",
}

// ── Client factory ────────────────────────────────────────────────────────────

export function getClient(signerAddress: string, signTransaction: (xdr: string) => Promise<string>) {
  const networkConfig = networks[STELLAR_NETWORK as keyof typeof networks] ?? networks.testnet
  return new Client({
    contractId: networkConfig.contractId,
    networkPassphrase: networkConfig.networkPassphrase,
    rpcUrl: RPC_URL,
    publicKey: signerAddress,
    signTransaction,
  })
}

// ── Typed contract actions ────────────────────────────────────────────────────

export async function contractPropose(params: {
  caller: string
  to: string
  token: TokenSymbol
  amount: number
  description: string
  signTransaction: (xdr: string) => Promise<string>
}): Promise<bigint> {
  const client = getClient(params.caller, params.signTransaction)
  const tx = await client.propose({
    caller: params.caller,
    to: params.to,
    token: TOKEN_ADDRESSES[params.token],
    // Soroban amounts are in stroops (1 XLM = 10_000_000 stroops)
    amount: BigInt(Math.round(params.amount * 1e7)),
    description: params.description,
  })
  const { result } = await tx.signAndSend()
  return result
}

export async function contractApprove(params: {
  caller: string
  nonce: number
  signTransaction: (xdr: string) => Promise<string>
}) {
  const client = getClient(params.caller, params.signTransaction)
  const tx = await client.approve({ caller: params.caller, nonce: BigInt(params.nonce) })
  await tx.signAndSend()
}

export async function contractRevoke(params: {
  caller: string
  nonce: number
  signTransaction: (xdr: string) => Promise<string>
}) {
  const client = getClient(params.caller, params.signTransaction)
  const tx = await client.revoke({ caller: params.caller, nonce: BigInt(params.nonce) })
  await tx.signAndSend()
}

export async function contractExecute(params: {
  caller: string
  nonce: number
  signTransaction: (xdr: string) => Promise<string>
}) {
  const client = getClient(params.caller, params.signTransaction)
  const tx = await client.execute({ caller: params.caller, nonce: BigInt(params.nonce) })
  await tx.signAndSend()
}

export async function contractCancel(params: {
  caller: string
  nonce: number
  signTransaction: (xdr: string) => Promise<string>
}) {
  const client = getClient(params.caller, params.signTransaction)
  const tx = await client.cancel({ caller: params.caller, nonce: BigInt(params.nonce) })
  await tx.signAndSend()
}

export async function contractAddOwner(params: {
  caller: string
  newOwner: Owner
  signTransaction: (xdr: string) => Promise<string>
}) {
  const client = getClient(params.caller, params.signTransaction)
  const ownerVal: ContractOwner = {
    address: params.newOwner.address,
    label: params.newOwner.label ?? "",
  }
  const tx = await client.add_owner({ caller: params.caller, new_owner: ownerVal })
  await tx.signAndSend()
}

export async function contractRemoveOwner(params: {
  caller: string
  target: string
  signTransaction: (xdr: string) => Promise<string>
}) {
  const client = getClient(params.caller, params.signTransaction)
  const tx = await client.remove_owner({ caller: params.caller, target: params.target })
  await tx.signAndSend()
}

export async function contractSetThreshold(params: {
  caller: string
  threshold: number
  signTransaction: (xdr: string) => Promise<string>
}) {
  const client = getClient(params.caller, params.signTransaction)
  const tx = await client.set_threshold({ caller: params.caller, new_threshold: params.threshold })
  await tx.signAndSend()
}

export async function contractSetPolicy(params: {
  caller: string
  beneficiary: string
  token: TokenSymbol
  limit: number
  period: "daily" | "weekly" | "monthly"
  signTransaction: (xdr: string) => Promise<string>
}): Promise<number> {
  const client = getClient(params.caller, params.signTransaction)
  const periodVal: Period =
    params.period === "daily"
      ? { tag: "Daily", values: undefined }
      : params.period === "weekly"
        ? { tag: "Weekly", values: undefined }
        : { tag: "Monthly", values: undefined }
  const tx = await client.set_policy({
    caller: params.caller,
    beneficiary: params.beneficiary,
    token: TOKEN_ADDRESSES[params.token],
    limit: BigInt(Math.round(params.limit * 1e7)),
    period: periodVal,
  })
  const { result } = await tx.signAndSend()
  return result
}
