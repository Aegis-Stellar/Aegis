# Deploying Aegis

## Prerequisites

- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli) v26+
- Rust stable with `wasm32v1-none` target (the CLI build command handles this)

---

## 1. Build

```bash
cd contracts/quorum
stellar contract build
```

Output: `target/wasm32v1-none/release/quorum.wasm`

The build summary will print the WASM hash and all 18 exported functions.

---

## 2. Create and fund a deployer account

```bash
# Generates a new keypair and funds it via Friendbot (testnet only)
stellar keys generate deployer --network testnet --fund

# Confirm it has a balance
stellar keys address deployer
# → G...
```

---

## 3. Deploy

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quorum.wasm \
  --source deployer \
  --network testnet
# → prints: CXXX...  (your CONTRACT_ID)
```

---

## 4. Initialize

Each deployed contract instance is an independent safe. Call `init` once with the initial owners and threshold:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- init \
  --owners '[{"address":"GABC...","label":"Alice"},{"address":"GDEF...","label":"Bob"}]' \
  --threshold 2
```

Verify it worked:

```bash
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- get_owners
# → [{"address":"GABC...","label":"Alice"}, ...]
```

---

## 5. Generate TypeScript bindings

Run this from the repo root:

```bash
stellar contract bindings typescript \
  --network testnet \
  --contract-id <CONTRACT_ID> \
  --output-dir src/contracts/quorum
```

Then build the bindings package:

```bash
cd src/contracts/quorum
npm install && npm run build
```

---

## 6. Connect the frontend

Copy `.env.example` to `.env.local`:

```env
VITE_STELLAR_NETWORK=testnet
VITE_QUORUM_CONTRACT_ID=<CONTRACT_ID>
VITE_USE_MOCK_WALLET=false
```

Restart `pnpm dev`. The app will now sign and submit real transactions to testnet.

---

## Redeploying / upgrading

Soroban contracts are immutable once deployed. To upgrade:

1. Make your changes to `lib.rs`
2. Run tests: `cargo test --features soroban-sdk/testutils`
3. Build: `stellar contract build`
4. Deploy a new instance and initialize it
5. Regenerate bindings and update `VITE_QUORUM_CONTRACT_ID`

---

## Currently deployed

| Network | Contract ID |
|---------|-------------|
| Testnet | `CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC` |
| Mainnet | — |
