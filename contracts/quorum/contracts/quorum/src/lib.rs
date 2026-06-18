#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol, Vec, token,
};

// ─── Storage key tags ────────────────────────────────────────────────────────

const OWNERS: Symbol = symbol_short!("OWNERS");
const THRESHOLD: Symbol = symbol_short!("THRESH");
const TX_COUNT: Symbol = symbol_short!("TX_CNT");
const POLICIES: Symbol = symbol_short!("POLS");

// ─── Data types ──────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub struct Owner {
    pub address: Address,
    pub label: String,
}

#[contracttype]
#[derive(Clone, PartialEq, Debug)]
pub enum TxStatus {
    Pending,
    Ready,
    Executed,
    Cancelled,
}

#[contracttype]
#[derive(Clone)]
pub struct Approval {
    pub owner: Address,
    pub approved_at: u64, // ledger timestamp
}

#[contracttype]
#[derive(Clone)]
pub struct Transaction {
    pub nonce: u64,
    pub to: Address,
    pub token: Address, // SAC contract address
    pub amount: i128,
    pub description: String,
    pub status: TxStatus,
    pub proposed_by: Address,
    pub proposed_at: u64,
    pub approvals: Vec<Approval>,
    pub executed_at: u64,  // 0 if not executed
    pub executed_by: Address, // sentinel if not executed
}

#[contracttype]
#[derive(Clone)]
pub enum Period {
    Daily,
    Weekly,
    Monthly,
}

#[contracttype]
#[derive(Clone)]
pub struct Policy {
    pub id: u32,
    pub beneficiary: Address,
    pub token: Address,  // SAC contract address
    pub limit: i128,
    pub spent: i128,
    pub period: Period,
    pub resets_at: u64,   // Unix timestamp
    pub enabled: bool,
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

fn get_owners(env: &Env) -> Vec<Owner> {
    env.storage().instance().get(&OWNERS).unwrap_or(Vec::new(env))
}

fn set_owners(env: &Env, owners: &Vec<Owner>) {
    env.storage().instance().set(&OWNERS, owners);
}

fn get_threshold(env: &Env) -> u32 {
    env.storage().instance().get(&THRESHOLD).unwrap_or(1)
}

fn set_threshold(env: &Env, t: u32) {
    env.storage().instance().set(&THRESHOLD, &t);
}

fn get_tx_count(env: &Env) -> u64 {
    env.storage().instance().get(&TX_COUNT).unwrap_or(0u64)
}

fn set_tx_count(env: &Env, n: u64) {
    env.storage().instance().set(&TX_COUNT, &n);
}

fn get_tx(env: &Env, nonce: u64) -> Option<Transaction> {
    let key = (symbol_short!("TX"), nonce);
    env.storage().persistent().get(&key)
}

fn set_tx(env: &Env, tx: &Transaction) {
    let key = (symbol_short!("TX"), tx.nonce);
    env.storage().persistent().set(&key, tx);
}

fn get_policies(env: &Env) -> Vec<Policy> {
    env.storage().instance().get(&POLICIES).unwrap_or(Vec::new(env))
}

fn set_policies(env: &Env, pols: &Vec<Policy>) {
    env.storage().instance().set(&POLICIES, pols);
}

// ─── Access helpers ───────────────────────────────────────────────────────────

fn require_owner(env: &Env, caller: &Address) {
    caller.require_auth();
    let owners = get_owners(env);
    let is_owner = owners.iter().any(|o| o.address == *caller);
    assert!(is_owner, "not an owner");
}

fn recompute_status(approvals: u32, threshold: u32) -> TxStatus {
    if approvals >= threshold {
        TxStatus::Ready
    } else {
        TxStatus::Pending
    }
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct AegisSafe;

#[contractimpl]
impl AegisSafe {
    /// Called once when the contract is first deployed / initialized.
    pub fn init(env: Env, owners: Vec<Owner>, threshold: u32) {
        assert!(!owners.is_empty(), "need at least one owner");
        assert!(threshold >= 1 && threshold <= owners.len() as u32, "invalid threshold");
        // Prevent re-initialization
        assert!(
            !env.storage().instance().has(&OWNERS),
            "already initialized"
        );
        set_owners(&env, &owners);
        set_threshold(&env, threshold);
        set_tx_count(&env, 0);
        env.events().publish((symbol_short!("INIT"),), (owners, threshold));
    }

    // ── Read ────────────────────────────────────────────────────────────────

    pub fn get_owners(env: Env) -> Vec<Owner> {
        get_owners(&env)
    }

    pub fn get_threshold(env: Env) -> u32 {
        get_threshold(&env)
    }

    pub fn get_tx_count(env: Env) -> u64 {
        get_tx_count(&env)
    }

    pub fn get_transaction(env: Env, nonce: u64) -> Transaction {
        get_tx(&env, nonce).expect("tx not found")
    }

    pub fn get_policies(env: Env) -> Vec<Policy> {
        get_policies(&env)
    }

    // ── Transaction lifecycle ───────────────────────────────────────────────

    /// Propose a new transaction. The proposer's approval is automatically added.
    pub fn propose(
        env: Env,
        caller: Address,
        to: Address,
        token: Address,
        amount: i128,
        description: String,
    ) -> u64 {
        require_owner(&env, &caller);
        assert!(amount > 0, "amount must be positive");

        let nonce = get_tx_count(&env);
        let threshold = get_threshold(&env);

        let approval = Approval {
            owner: caller.clone(),
            approved_at: env.ledger().timestamp(),
        };
        let mut approvals = Vec::new(&env);
        approvals.push_back(approval);

        let status = recompute_status(approvals.len() as u32, threshold);

        let tx = Transaction {
            nonce,
            to,
            token,
            amount,
            description,
            status,
            proposed_by: caller.clone(),
            proposed_at: env.ledger().timestamp(),
            approvals,
            executed_at: 0,
            executed_by: caller, // placeholder
        };

        set_tx(&env, &tx);
        set_tx_count(&env, nonce + 1);

        env.events().publish((symbol_short!("PROPOSE"), nonce), ());
        nonce
    }

    /// Approve a pending transaction. Idempotent per owner.
    pub fn approve(env: Env, caller: Address, nonce: u64) {
        require_owner(&env, &caller);

        let mut tx = get_tx(&env, nonce).expect("tx not found");
        assert!(
            tx.status == TxStatus::Pending || tx.status == TxStatus::Ready,
            "tx not active"
        );

        // Idempotent: skip if already approved
        let already = tx.approvals.iter().any(|a| a.owner == caller);
        if already {
            return;
        }

        tx.approvals.push_back(Approval {
            owner: caller,
            approved_at: env.ledger().timestamp(),
        });
        tx.status = recompute_status(tx.approvals.len() as u32, get_threshold(&env));
        set_tx(&env, &tx);

        env.events().publish((symbol_short!("APPROVE"), nonce), ());
    }

    /// Revoke an owner's approval.
    pub fn revoke(env: Env, caller: Address, nonce: u64) {
        require_owner(&env, &caller);

        let mut tx = get_tx(&env, nonce).expect("tx not found");
        assert!(
            tx.status == TxStatus::Pending || tx.status == TxStatus::Ready,
            "tx not active"
        );

        let mut new_approvals = Vec::new(&env);
        for a in tx.approvals.iter() {
            if a.owner != caller {
                new_approvals.push_back(a);
            }
        }
        tx.approvals = new_approvals;
        tx.status = recompute_status(tx.approvals.len() as u32, get_threshold(&env));
        set_tx(&env, &tx);

        env.events().publish((symbol_short!("REVOKE"), nonce), ());
    }

    /// Execute a ready transaction — transfers tokens via the Stellar Asset Contract.
    pub fn execute(env: Env, caller: Address, nonce: u64) {
        require_owner(&env, &caller);

        let mut tx = get_tx(&env, nonce).expect("tx not found");
        assert!(tx.status == TxStatus::Ready, "tx not ready");

        // Transfer via SAC
        let sac = token::Client::new(&env, &tx.token);
        sac.transfer(&env.current_contract_address(), &tx.to, &tx.amount);

        tx.status = TxStatus::Executed;
        tx.executed_at = env.ledger().timestamp();
        tx.executed_by = caller;
        set_tx(&env, &tx);

        env.events().publish((symbol_short!("EXECUTE"), nonce), ());
    }

    /// Cancel a pending/ready transaction (any owner can cancel).
    pub fn cancel(env: Env, caller: Address, nonce: u64) {
        require_owner(&env, &caller);

        let mut tx = get_tx(&env, nonce).expect("tx not found");
        assert!(
            tx.status == TxStatus::Pending || tx.status == TxStatus::Ready,
            "tx not active"
        );

        tx.status = TxStatus::Cancelled;
        set_tx(&env, &tx);

        env.events().publish((symbol_short!("CANCEL"), nonce), ());
    }

    // ── Owner management ────────────────────────────────────────────────────

    /// Add a new owner. Must be called as a multisig action (validated externally
    /// by requiring the caller to be an existing owner who has been authorised by
    /// the current threshold — enforce this via a wrapper propose/execute flow in
    /// the UI; here the contract simply requires caller is already an owner).
    pub fn add_owner(env: Env, caller: Address, new_owner: Owner) {
        require_owner(&env, &caller);

        let mut owners = get_owners(&env);
        let exists = owners.iter().any(|o| o.address == new_owner.address);
        assert!(!exists, "already an owner");

        owners.push_back(new_owner.clone());
        set_owners(&env, &owners);

        env.events()
            .publish((symbol_short!("ADD_OWN"),), new_owner.address);
    }

    /// Remove an owner. Threshold is clamped to owners.len() if needed.
    pub fn remove_owner(env: Env, caller: Address, target: Address) {
        require_owner(&env, &caller);

        let owners = get_owners(&env);
        assert!(owners.len() > 1, "cannot remove last owner");

        let mut new_owners = Vec::new(&env);
        for o in owners.iter() {
            if o.address != target {
                new_owners.push_back(o);
            }
        }
        set_owners(&env, &new_owners);

        // Clamp threshold
        let t = get_threshold(&env);
        if t > new_owners.len() as u32 {
            set_threshold(&env, new_owners.len() as u32);
        }

        env.events().publish((symbol_short!("REM_OWN"),), target);
    }

    /// Update the approval threshold.
    pub fn set_threshold(env: Env, caller: Address, new_threshold: u32) {
        require_owner(&env, &caller);
        let owners = get_owners(&env);
        assert!(
            new_threshold >= 1 && new_threshold <= owners.len() as u32,
            "invalid threshold"
        );
        set_threshold(&env, new_threshold);
        env.events()
            .publish((symbol_short!("SET_THR"),), new_threshold);
    }

    // ── Spending policies ───────────────────────────────────────────────────

    /// Create a recurring spending allowance for a beneficiary.
    pub fn set_policy(
        env: Env,
        caller: Address,
        beneficiary: Address,
        token: Address,
        limit: i128,
        period: Period,
    ) -> u32 {
        require_owner(&env, &caller);
        assert!(limit > 0, "limit must be positive");

        let mut policies = get_policies(&env);
        let id = policies.len() as u32;

        let resets_at = env.ledger().timestamp() + period_seconds(&period);

        policies.push_back(Policy {
            id,
            beneficiary,
            token,
            limit,
            spent: 0,
            period,
            resets_at,
            enabled: true,
        });
        set_policies(&env, &policies);
        id
    }

    /// Spend via an active policy — single-signer, no multisig needed.
    pub fn spend_via_policy(env: Env, caller: Address, policy_id: u32, to: Address, amount: i128) {
        caller.require_auth();

        let mut policies = get_policies(&env);
        let idx = policies
            .iter()
            .position(|p| p.id == policy_id)
            .expect("policy not found") as u32;

        let mut pol = policies.get(idx).unwrap();
        assert!(pol.enabled, "policy disabled");
        assert!(pol.beneficiary == caller, "not the policy beneficiary");
        assert!(amount > 0 && amount <= pol.limit, "amount out of range");

        // Auto-reset if period elapsed
        let now = env.ledger().timestamp();
        if now >= pol.resets_at {
            pol.spent = 0;
            pol.resets_at = now + period_seconds(&pol.period);
        }

        assert!(pol.spent + amount <= pol.limit, "limit exceeded");
        pol.spent += amount;

        policies.set(idx, pol.clone());
        set_policies(&env, &policies);

        // Transfer via SAC
        let sac = token::Client::new(&env, &pol.token);
        sac.transfer(&env.current_contract_address(), &to, &amount);

        env.events()
            .publish((symbol_short!("POLICY"),), (policy_id, amount));
    }

    /// Toggle a policy on/off.
    pub fn toggle_policy(env: Env, caller: Address, policy_id: u32) {
        require_owner(&env, &caller);

        let mut policies = get_policies(&env);
        let idx = policies
            .iter()
            .position(|p| p.id == policy_id)
            .expect("policy not found") as u32;

        let mut pol = policies.get(idx).unwrap();
        pol.enabled = !pol.enabled;
        policies.set(idx, pol);
        set_policies(&env, &policies);
    }

    /// Remove a policy entirely.
    pub fn remove_policy(env: Env, caller: Address, policy_id: u32) {
        require_owner(&env, &caller);

        let policies = get_policies(&env);
        let mut new_pols = Vec::new(&env);
        for p in policies.iter() {
            if p.id != policy_id {
                new_pols.push_back(p);
            }
        }
        set_policies(&env, &new_pols);
    }
}

fn period_seconds(p: &Period) -> u64 {
    match p {
        Period::Daily => 86_400,
        Period::Weekly => 604_800,
        Period::Monthly => 2_592_000, // 30 days
    }
}

mod test;
