/**
 * Quorum Soroban contract bindings (stub).
 *
 * In production this module is generated from the deployed Quorum contract via
 * `stellar contract bindings typescript` and wraps each contract method:
 *
 *   - create_safe(owners, threshold)
 *   - propose(safe, to, token, amount, data)
 *   - approve(safe, tx_id)
 *   - execute(safe, tx_id)
 *   - cancel(safe, tx_id)
 *   - add_owner(safe, owner) / remove_owner(safe, owner)
 *   - set_threshold(safe, n)
 *   - set_policy(safe, beneficiary, token, limit, period)
 *   - spend_via_policy(safe, to, amount)   // single-signer, bypasses threshold
 *
 * For this UI build, the reactive store in `lib/store.ts` simulates contract
 * state so the full product is navigable without a wallet or testnet.
 */

export const QUORUM_CONTRACT_ID = "CQRMxxxxQUORUMFACTORYxxxxSOROBANxxxxCONTRACTxxxxIDxxxxxx"
export const STELLAR_NETWORK = "testnet" as const
