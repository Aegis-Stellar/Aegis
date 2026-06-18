import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDCZPVIELPPTV3VXUHSNFIKXASF2YIDYRSS2PWNN6KHFSS6JVEEIPDQC",
  }
} as const


export interface Owner {
  address: string;
  label: string;
}

export type Period = {tag: "Daily", values: void} | {tag: "Weekly", values: void} | {tag: "Monthly", values: void};


export interface Policy {
  beneficiary: string;
  enabled: boolean;
  id: u32;
  limit: i128;
  period: Period;
  resets_at: u64;
  spent: i128;
  token: string;
}


export interface Approval {
  approved_at: u64;
  owner: string;
}

export type TxStatus = {tag: "Pending", values: void} | {tag: "Ready", values: void} | {tag: "Executed", values: void} | {tag: "Cancelled", values: void};


export interface Transaction {
  amount: i128;
  approvals: Array<Approval>;
  description: string;
  executed_at: u64;
  executed_by: string;
  nonce: u64;
  proposed_at: u64;
  proposed_by: string;
  status: TxStatus;
  to: string;
  token: string;
}

export interface Client {
  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Called once when the contract is first deployed / initialized.
   */
  init: ({owners, threshold}: {owners: Array<Owner>, threshold: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a cancel transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancel a pending/ready transaction (any owner can cancel).
   */
  cancel: ({caller, nonce}: {caller: string, nonce: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a revoke transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Revoke an owner's approval.
   */
  revoke: ({caller, nonce}: {caller: string, nonce: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a approve transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Approve a pending transaction. Idempotent per owner.
   */
  approve: ({caller, nonce}: {caller: string, nonce: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a execute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Execute a ready transaction — transfers tokens via the Stellar Asset Contract.
   */
  execute: ({caller, nonce}: {caller: string, nonce: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a propose transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Propose a new transaction. The proposer's approval is automatically added.
   */
  propose: ({caller, to, token, amount, description}: {caller: string, to: string, token: string, amount: i128, description: string}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a add_owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Add a new owner. Must be called as a multisig action (validated externally
   * by requiring the caller to be an existing owner who has been authorised by
   * the current threshold — enforce this via a wrapper propose/execute flow in
   * the UI; here the contract simply requires caller is already an owner).
   */
  add_owner: ({caller, new_owner}: {caller: string, new_owner: Owner}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_owners transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_owners: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Owner>>>

  /**
   * Construct and simulate a set_policy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a recurring spending allowance for a beneficiary.
   */
  set_policy: ({caller, beneficiary, token, limit, period}: {caller: string, beneficiary: string, token: string, limit: i128, period: Period}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_policies transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_policies: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Policy>>>

  /**
   * Construct and simulate a get_tx_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_tx_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a remove_owner transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Remove an owner. Threshold is clamped to owners.len() if needed.
   */
  remove_owner: ({caller, target}: {caller: string, target: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_threshold: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a remove_policy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Remove a policy entirely.
   */
  remove_policy: ({caller, policy_id}: {caller: string, policy_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a set_threshold transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update the approval threshold.
   */
  set_threshold: ({caller, new_threshold}: {caller: string, new_threshold: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a toggle_policy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Toggle a policy on/off.
   */
  toggle_policy: ({caller, policy_id}: {caller: string, policy_id: u32}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_transaction transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_transaction: ({nonce}: {nonce: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Transaction>>

  /**
   * Construct and simulate a spend_via_policy transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Spend via an active policy — single-signer, no multisig needed.
   */
  spend_via_policy: ({caller, policy_id, to, amount}: {caller: string, policy_id: u32, to: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABU93bmVyAAAAAAAAAgAAAAAAAAAHYWRkcmVzcwAAAAATAAAAAAAAAAVsYWJlbAAAAAAAABA=",
        "AAAAAgAAAAAAAAAAAAAABlBlcmlvZAAAAAAAAwAAAAAAAAAAAAAABURhaWx5AAAAAAAAAAAAAAAAAAAGV2Vla2x5AAAAAAAAAAAAAAAAAAdNb250aGx5AA==",
        "AAAAAQAAAAAAAAAAAAAABlBvbGljeQAAAAAACAAAAAAAAAALYmVuZWZpY2lhcnkAAAAAEwAAAAAAAAAHZW5hYmxlZAAAAAABAAAAAAAAAAJpZAAAAAAABAAAAAAAAAAFbGltaXQAAAAAAAALAAAAAAAAAAZwZXJpb2QAAAAAB9AAAAAGUGVyaW9kAAAAAAAAAAAACXJlc2V0c19hdAAAAAAAAAYAAAAAAAAABXNwZW50AAAAAAAACwAAAAAAAAAFdG9rZW4AAAAAAAAT",
        "AAAAAAAAAD5DYWxsZWQgb25jZSB3aGVuIHRoZSBjb250cmFjdCBpcyBmaXJzdCBkZXBsb3llZCAvIGluaXRpYWxpemVkLgAAAAAABGluaXQAAAACAAAAAAAAAAZvd25lcnMAAAAAA+oAAAfQAAAABU93bmVyAAAAAAAAAAAAAAl0aHJlc2hvbGQAAAAAAAAEAAAAAA==",
        "AAAAAQAAAAAAAAAAAAAACEFwcHJvdmFsAAAAAgAAAAAAAAALYXBwcm92ZWRfYXQAAAAABgAAAAAAAAAFb3duZXIAAAAAAAAT",
        "AAAAAgAAAAAAAAAAAAAACFR4U3RhdHVzAAAABAAAAAAAAAAAAAAAB1BlbmRpbmcAAAAAAAAAAAAAAAAFUmVhZHkAAAAAAAAAAAAAAAAAAAhFeGVjdXRlZAAAAAAAAAAAAAAACUNhbmNlbGxlZAAAAA==",
        "AAAAAAAAADpDYW5jZWwgYSBwZW5kaW5nL3JlYWR5IHRyYW5zYWN0aW9uIChhbnkgb3duZXIgY2FuIGNhbmNlbCkuAAAAAAAGY2FuY2VsAAAAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABW5vbmNlAAAAAAAABgAAAAA=",
        "AAAAAAAAABtSZXZva2UgYW4gb3duZXIncyBhcHByb3ZhbC4AAAAABnJldm9rZQAAAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAVub25jZQAAAAAAAAYAAAAA",
        "AAAAAAAAADRBcHByb3ZlIGEgcGVuZGluZyB0cmFuc2FjdGlvbi4gSWRlbXBvdGVudCBwZXIgb3duZXIuAAAAB2FwcHJvdmUAAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAVub25jZQAAAAAAAAYAAAAA",
        "AAAAAAAAAFBFeGVjdXRlIGEgcmVhZHkgdHJhbnNhY3Rpb24g4oCUIHRyYW5zZmVycyB0b2tlbnMgdmlhIHRoZSBTdGVsbGFyIEFzc2V0IENvbnRyYWN0LgAAAAdleGVjdXRlAAAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAFbm9uY2UAAAAAAAAGAAAAAA==",
        "AAAAAAAAAEpQcm9wb3NlIGEgbmV3IHRyYW5zYWN0aW9uLiBUaGUgcHJvcG9zZXIncyBhcHByb3ZhbCBpcyBhdXRvbWF0aWNhbGx5IGFkZGVkLgAAAAAAB3Byb3Bvc2UAAAAABQAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAJ0bwAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAABAAAABg==",
        "AAAAAQAAAAAAAAAAAAAAC1RyYW5zYWN0aW9uAAAAAAsAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAJYXBwcm92YWxzAAAAAAAD6gAAB9AAAAAIQXBwcm92YWwAAAAAAAAAC2Rlc2NyaXB0aW9uAAAAABAAAAAAAAAAC2V4ZWN1dGVkX2F0AAAAAAYAAAAAAAAAC2V4ZWN1dGVkX2J5AAAAABMAAAAAAAAABW5vbmNlAAAAAAAABgAAAAAAAAALcHJvcG9zZWRfYXQAAAAABgAAAAAAAAALcHJvcG9zZWRfYnkAAAAAEwAAAAAAAAAGc3RhdHVzAAAAAAfQAAAACFR4U3RhdHVzAAAAAAAAAAJ0bwAAAAAAEwAAAAAAAAAFdG9rZW4AAAAAAAAT",
        "AAAAAAAAASlBZGQgYSBuZXcgb3duZXIuIE11c3QgYmUgY2FsbGVkIGFzIGEgbXVsdGlzaWcgYWN0aW9uICh2YWxpZGF0ZWQgZXh0ZXJuYWxseQpieSByZXF1aXJpbmcgdGhlIGNhbGxlciB0byBiZSBhbiBleGlzdGluZyBvd25lciB3aG8gaGFzIGJlZW4gYXV0aG9yaXNlZCBieQp0aGUgY3VycmVudCB0aHJlc2hvbGQg4oCUIGVuZm9yY2UgdGhpcyB2aWEgYSB3cmFwcGVyIHByb3Bvc2UvZXhlY3V0ZSBmbG93IGluCnRoZSBVSTsgaGVyZSB0aGUgY29udHJhY3Qgc2ltcGx5IHJlcXVpcmVzIGNhbGxlciBpcyBhbHJlYWR5IGFuIG93bmVyKS4AAAAAAAAJYWRkX293bmVyAAAAAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAluZXdfb3duZXIAAAAAAAfQAAAABU93bmVyAAAAAAAAAA==",
        "AAAAAAAAAAAAAAAKZ2V0X293bmVycwAAAAAAAAAAAAEAAAPqAAAH0AAAAAVPd25lcgAAAA==",
        "AAAAAAAAADhDcmVhdGUgYSByZWN1cnJpbmcgc3BlbmRpbmcgYWxsb3dhbmNlIGZvciBhIGJlbmVmaWNpYXJ5LgAAAApzZXRfcG9saWN5AAAAAAAFAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAAC2JlbmVmaWNpYXJ5AAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAAAAAAFbGltaXQAAAAAAAALAAAAAAAAAAZwZXJpb2QAAAAAB9AAAAAGUGVyaW9kAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAMZ2V0X3BvbGljaWVzAAAAAAAAAAEAAAPqAAAH0AAAAAZQb2xpY3kAAA==",
        "AAAAAAAAAAAAAAAMZ2V0X3R4X2NvdW50AAAAAAAAAAEAAAAG",
        "AAAAAAAAAEBSZW1vdmUgYW4gb3duZXIuIFRocmVzaG9sZCBpcyBjbGFtcGVkIHRvIG93bmVycy5sZW4oKSBpZiBuZWVkZWQuAAAADHJlbW92ZV9vd25lcgAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAGdGFyZ2V0AAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAANZ2V0X3RocmVzaG9sZAAAAAAAAAAAAAABAAAABA==",
        "AAAAAAAAABlSZW1vdmUgYSBwb2xpY3kgZW50aXJlbHkuAAAAAAAADXJlbW92ZV9wb2xpY3kAAAAAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAACXBvbGljeV9pZAAAAAAAAAQAAAAA",
        "AAAAAAAAAB5VcGRhdGUgdGhlIGFwcHJvdmFsIHRocmVzaG9sZC4AAAAAAA1zZXRfdGhyZXNob2xkAAAAAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAA1uZXdfdGhyZXNob2xkAAAAAAAABAAAAAA=",
        "AAAAAAAAABdUb2dnbGUgYSBwb2xpY3kgb24vb2ZmLgAAAAANdG9nZ2xlX3BvbGljeQAAAAAAAAIAAAAAAAAABmNhbGxlcgAAAAAAEwAAAAAAAAAJcG9saWN5X2lkAAAAAAAABAAAAAA=",
        "AAAAAAAAAAAAAAAPZ2V0X3RyYW5zYWN0aW9uAAAAAAEAAAAAAAAABW5vbmNlAAAAAAAABgAAAAEAAAfQAAAAC1RyYW5zYWN0aW9uAA==",
        "AAAAAAAAAEFTcGVuZCB2aWEgYW4gYWN0aXZlIHBvbGljeSDigJQgc2luZ2xlLXNpZ25lciwgbm8gbXVsdGlzaWcgbmVlZGVkLgAAAAAAABBzcGVuZF92aWFfcG9saWN5AAAABAAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAlwb2xpY3lfaWQAAAAAAAAEAAAAAAAAAAJ0bwAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    init: this.txFromJSON<null>,
        cancel: this.txFromJSON<null>,
        revoke: this.txFromJSON<null>,
        approve: this.txFromJSON<null>,
        execute: this.txFromJSON<null>,
        propose: this.txFromJSON<u64>,
        add_owner: this.txFromJSON<null>,
        get_owners: this.txFromJSON<Array<Owner>>,
        set_policy: this.txFromJSON<u32>,
        get_policies: this.txFromJSON<Array<Policy>>,
        get_tx_count: this.txFromJSON<u64>,
        remove_owner: this.txFromJSON<null>,
        get_threshold: this.txFromJSON<u32>,
        remove_policy: this.txFromJSON<null>,
        set_threshold: this.txFromJSON<null>,
        toggle_policy: this.txFromJSON<null>,
        get_transaction: this.txFromJSON<Transaction>,
        spend_via_policy: this.txFromJSON<null>
  }
}