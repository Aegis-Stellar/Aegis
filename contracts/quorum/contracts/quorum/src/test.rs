#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, AuthorizedFunction, AuthorizedInvocation, Ledger},
    token, Address, Env, IntoVal, String, Vec,
};

// Helper: deploy a fresh SAC token and mint `amount` to `to`
fn create_token<'a>(env: &'a Env, admin: &Address) -> (Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let sac_addr = env.register_stellar_asset_contract_v2(admin.clone());
    let client = token::Client::new(env, &sac_addr.address());
    let asset_client = token::StellarAssetClient::new(env, &sac_addr.address());
    (sac_addr.address(), client, asset_client)
}

fn make_owner(env: &Env, addr: &Address) -> Owner {
    Owner {
        address: addr.clone(),
        label: String::from_str(env, "Owner"),
    }
}

fn deploy_safe(env: &Env, owners: Vec<Owner>, threshold: u32) -> AegisSafeClient {
    let contract_id = env.register(AegisSafe, ());
    let client = AegisSafeClient::new(env, &contract_id);
    client.init(&owners, &threshold);
    client
}

// ─── init ────────────────────────────────────────────────────────────────────

#[test]
fn test_init_and_read() {
    let env = Env::default();
    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    owners.push_back(make_owner(&env, &b));

    let client = deploy_safe(&env, owners.clone(), 2);

    assert_eq!(client.get_threshold(), 2);
    assert_eq!(client.get_owners().len(), 2);
    assert_eq!(client.get_tx_count(), 0);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_init_panics() {
    let env = Env::default();
    let a = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    let client = deploy_safe(&env, owners.clone(), 1);
    client.init(&owners, &1);
}

// ─── propose / approve / execute ─────────────────────────────────────────────

#[test]
fn test_propose_auto_approves_proposer() {
    let env = Env::default();
    env.mock_all_auths();

    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    owners.push_back(make_owner(&env, &b));
    let client = deploy_safe(&env, owners, 2);

    let (tok_addr, _tok, tok_admin) = create_token(&env, &a);
    tok_admin.mint(&client.address, &100_000);

    let to = Address::generate(&env);
    let nonce = client.propose(
        &a,
        &to,
        &tok_addr,
        &50_000,
        &String::from_str(&env, "Test"),
    );
    assert_eq!(nonce, 0);

    let tx = client.get_transaction(&nonce);
    assert_eq!(tx.approvals.len(), 1);
    assert_eq!(tx.status, TxStatus::Pending); // needs 2, only has 1
}

#[test]
fn test_approve_and_execute() {
    let env = Env::default();
    env.mock_all_auths();

    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    owners.push_back(make_owner(&env, &b));
    let client = deploy_safe(&env, owners, 2);

    let (tok_addr, tok, tok_admin) = create_token(&env, &a);
    tok_admin.mint(&client.address, &100_000);

    let to = Address::generate(&env);
    let nonce = client.propose(&a, &to, &tok_addr, &50_000, &String::from_str(&env, "T"));

    client.approve(&b, &nonce);
    let tx = client.get_transaction(&nonce);
    assert_eq!(tx.status, TxStatus::Ready);

    client.execute(&a, &nonce);
    assert_eq!(tok.balance(&to), 50_000);
    assert_eq!(client.get_transaction(&nonce).status, TxStatus::Executed);
}

#[test]
fn test_cancel() {
    let env = Env::default();
    env.mock_all_auths();

    let a = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    let client = deploy_safe(&env, owners, 1);

    let (tok_addr, _, tok_admin) = create_token(&env, &a);
    tok_admin.mint(&client.address, &100_000);

    let to = Address::generate(&env);
    let nonce = client.propose(&a, &to, &tok_addr, &1000, &String::from_str(&env, "T"));
    // threshold=1 so it auto-readies
    client.cancel(&a, &nonce);
    assert_eq!(client.get_transaction(&nonce).status, TxStatus::Cancelled);
}

#[test]
fn test_revoke_approval() {
    let env = Env::default();
    env.mock_all_auths();

    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    owners.push_back(make_owner(&env, &b));
    let client = deploy_safe(&env, owners, 2);

    let (tok_addr, _, tok_admin) = create_token(&env, &a);
    tok_admin.mint(&client.address, &100_000);

    let to = Address::generate(&env);
    let nonce = client.propose(&a, &to, &tok_addr, &1000, &String::from_str(&env, "T"));
    client.approve(&b, &nonce);
    assert_eq!(client.get_transaction(&nonce).status, TxStatus::Ready);

    client.revoke(&b, &nonce);
    assert_eq!(client.get_transaction(&nonce).status, TxStatus::Pending);
    assert_eq!(client.get_transaction(&nonce).approvals.len(), 1);
}

// ─── owner management ────────────────────────────────────────────────────────

#[test]
fn test_add_and_remove_owner() {
    let env = Env::default();
    env.mock_all_auths();

    let a = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    let client = deploy_safe(&env, owners, 1);

    let c = Address::generate(&env);
    client.add_owner(&a, &make_owner(&env, &c));
    assert_eq!(client.get_owners().len(), 2);

    client.remove_owner(&a, &c);
    assert_eq!(client.get_owners().len(), 1);
}

#[test]
fn test_remove_owner_clamps_threshold() {
    let env = Env::default();
    env.mock_all_auths();

    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    owners.push_back(make_owner(&env, &b));
    let client = deploy_safe(&env, owners, 2);

    client.remove_owner(&a, &b);
    assert_eq!(client.get_threshold(), 1); // clamped from 2 → 1
}

#[test]
fn test_set_threshold() {
    let env = Env::default();
    env.mock_all_auths();

    let a = Address::generate(&env);
    let b = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &a));
    owners.push_back(make_owner(&env, &b));
    let client = deploy_safe(&env, owners, 1);

    client.set_threshold(&a, &2);
    assert_eq!(client.get_threshold(), 2);
}

// ─── spending policies ───────────────────────────────────────────────────────

#[test]
fn test_policy_spend() {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &owner));
    let client = deploy_safe(&env, owners, 1);

    let (tok_addr, tok, tok_admin) = create_token(&env, &owner);
    tok_admin.mint(&client.address, &100_000);

    let policy_id = client.set_policy(
        &owner,
        &beneficiary,
        &tok_addr,
        &5_000,
        &Period::Monthly,
    );

    let to = Address::generate(&env);
    client.spend_via_policy(&beneficiary, &policy_id, &to, &1_000);
    assert_eq!(tok.balance(&to), 1_000);

    let pols = client.get_policies();
    assert_eq!(pols.get(0).unwrap().spent, 1_000);
}

#[test]
#[should_panic(expected = "amount out of range")]
fn test_policy_limit_enforced() {
    let env = Env::default();
    env.mock_all_auths();

    let owner = Address::generate(&env);
    let beneficiary = Address::generate(&env);
    let mut owners = Vec::new(&env);
    owners.push_back(make_owner(&env, &owner));
    let client = deploy_safe(&env, owners, 1);

    let (tok_addr, _tok, tok_admin) = create_token(&env, &owner);
    tok_admin.mint(&client.address, &100_000);

    let policy_id = client.set_policy(&owner, &beneficiary, &tok_addr, &500, &Period::Weekly);
    let to = Address::generate(&env);
    client.spend_via_policy(&beneficiary, &policy_id, &to, &501);
}
