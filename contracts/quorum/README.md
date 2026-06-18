# Aegis — Soroban Smart Contract

Multisig safe contract for the Stellar network, written in Rust using the Soroban SDK.

**Deployed on testnet:** `CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC`

---

## Structure

```
contracts/quorum/
├── Cargo.toml                  # Workspace manifest
└── contracts/quorum/
    ├── Cargo.toml              # Contract crate
    ├── Makefile
    └── src/
        ├── lib.rs              # Contract implementation
        └── test.rs             # Unit tests
```

---

## Contract overview

### Data types

- `Owner` — `{ address, label }` — a named signer
- `Transaction` — proposed transfer with approval list and status
- `TxStatus` — `Pending | Ready | Executed | Cancelled`
- `Policy` — recurring spending allowance with period and limit
- `Period` — `Daily | Weekly | Monthly`

### Storage

- Instance storage: `owners`, `threshold`, `tx_count`, `policies`
- Persistent storage: individual transactions keyed by `(TX, nonce)`

---

## Building

```bash
# From contracts/quorum/
stellar contract build
```

Output: `target/wasm32v1-none/release/quorum.wasm` (~13kb optimized)

Requires:
- Rust stable
- `wasm32v1-none` target (installed automatically by the Stellar CLI build)
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)

---

## Testing

```bash
cargo test --features soroban-sdk/testutils
```

11 tests covering:
- Init and double-init guard
- Propose → approve → execute lifecycle
- Cancel and revoke approval
- Owner add/remove with threshold clamping
- Spending policy creation, enforcement, and limit checks

---

## Deploying

See [`DEPLOY.md`](./DEPLOY.md) for full step-by-step instructions.

Quick reference:

```bash
# Build
stellar contract build

# Deploy
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quorum.wasm \
  --source <KEY_NAME> \
  --network testnet

# Initialize
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <KEY_NAME> \
  --network testnet \
  -- init \
  --owners '[{"address":"G...","label":"Alice"},{"address":"G...","label":"Bob"}]' \
  --threshold 2

# Generate TypeScript bindings
stellar contract bindings typescript \
  --network testnet \
  --contract-id <CONTRACT_ID> \
  --output-dir ../../src/contracts/quorum
```
