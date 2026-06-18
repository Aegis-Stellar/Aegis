# Aegis

Multisig safe for DAOs and teams on Stellar. Set M-of-N approval thresholds, track who signed every transaction, and grant native spending policies without weakening your treasury.

Built with Soroban smart contracts and a React + Vite frontend.

**Testnet contract:** `CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC`
[View on Stellar Expert →](https://stellar.expert/explorer/testnet/contract/CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC)

---

## Features

- **Multisig safes** — deploy a safe with any set of Stellar addresses and a configurable M-of-N threshold
- **Proposal queue** — propose transactions, collect approvals over time, execute when ready
- **Approval transparency** — see exactly who approved and who hasn't on every transaction
- **Spending policies** — grant per-owner recurring allowances (daily/weekly/monthly) that bypass the threshold
- **Owner management** — add/remove owners and update thresholds with the same multisig guarantees
- **Any Stellar wallet** — Freighter, xBull, Albedo, Lobstr via Stellar Wallets Kit

---

## Stack

| Layer | Technology |
|-------|-----------|
| Smart contract | Rust / Soroban SDK 26 |
| Frontend | React 19 + Vite + React Router 7 |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Wallet | @creit.tech/stellar-wallets-kit v2 |
| Contract client | @stellar/stellar-sdk 16 (generated bindings) |

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 11+

### Install and run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

The app runs in **mock mode** by default — wallet connection and transactions are simulated locally, no real wallet needed.

### Enable real wallet signing

1. Copy the env file and set your values:

```bash
cp .env.example .env.local
```

```env
VITE_STELLAR_NETWORK=testnet
VITE_QUORUM_CONTRACT_ID=CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC
VITE_USE_MOCK_WALLET=false
```

2. Install [Freighter](https://freighter.app) (or another supported wallet) and fund a testnet account via [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test).

3. Restart the dev server — the wallet picker modal will appear on connect.

---

## Project structure

```
.
├── src/
│   ├── contracts/quorum/     # Auto-generated TypeScript bindings
│   ├── components/
│   │   ├── layout/           # Navbar, WalletGate, ConnectWallet
│   │   ├── safe/             # SafeCard, OwnerBadge
│   │   ├── transactions/     # TransactionCard, ApprovalTracker, TxActions
│   │   └── ui/               # Button, Badge, Card, Input, Identicon, ...
│   ├── hooks/
│   │   ├── useSafe.ts        # Safe/transaction lookup hooks
│   │   ├── useStore.ts       # Reactive store subscription
│   │   └── useWallet.ts      # Wallet connection (real + mock)
│   ├── lib/
│   │   ├── quorum.ts         # Contract client factory + typed actions
│   │   ├── store.ts          # In-memory reactive state (mirrors contract)
│   │   ├── mock-data.ts      # Demo safes and transactions
│   │   └── format.ts         # Address, currency, time formatters
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── MySafes.tsx
│   │   ├── CreateSafe.tsx
│   │   ├── SafeDetail.tsx
│   │   ├── ProposeTransaction.tsx
│   │   ├── TransactionDetail.tsx
│   │   └── SafeSettings.tsx
│   ├── types/safe.ts         # Shared TypeScript types
│   └── main.tsx              # App entry + React Router config
├── contracts/quorum/         # Soroban smart contract (Rust)
│   └── contracts/quorum/src/
│       ├── lib.rs            # Contract implementation
│       └── test.rs           # 11 unit tests
├── .env.example
├── vite.config.ts
└── index.html
```

---

## Contract

The Aegis Soroban contract is in `contracts/quorum/`. See [`contracts/quorum/DEPLOY.md`](contracts/quorum/DEPLOY.md) for build, deploy, and re-deploy instructions.

### Contract methods

| Method | Description |
|--------|-------------|
| `init(owners, threshold)` | Initialize safe — called once on deploy |
| `propose(caller, to, token, amount, description)` | Propose a transaction |
| `approve(caller, nonce)` | Approve a pending transaction |
| `revoke(caller, nonce)` | Revoke your approval |
| `execute(caller, nonce)` | Execute a ready transaction |
| `cancel(caller, nonce)` | Cancel a pending/ready transaction |
| `add_owner(caller, owner)` | Add a new owner |
| `remove_owner(caller, target)` | Remove an owner |
| `set_threshold(caller, n)` | Update the approval threshold |
| `set_policy(caller, beneficiary, token, limit, period)` | Create spending policy |
| `spend_via_policy(caller, policy_id, to, amount)` | Single-signer spend within policy |
| `toggle_policy(caller, policy_id)` | Pause/resume a policy |
| `remove_policy(caller, policy_id)` | Delete a policy |

### Run contract tests

```bash
cd contracts/quorum
cargo test --features soroban-sdk/testutils
# 11 tests, ~0.15s
```

---

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_STELLAR_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `VITE_QUORUM_CONTRACT_ID` | — | Deployed contract address |
| `VITE_USE_MOCK_WALLET` | `true` | `false` to enable real wallet signing |

---

## Contributing

1. Fork and clone
2. `pnpm install && pnpm dev`
3. For contract changes: edit `contracts/quorum/contracts/quorum/src/lib.rs`, run tests, rebuild, redeploy, regenerate bindings
4. Open a PR against `main`
