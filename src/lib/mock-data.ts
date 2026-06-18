import type { Safe } from "@/types/safe"

/** The mock "connected wallet" address — one of the owners across the safes. */
export const CURRENT_USER = "GAULT3RXVKP7BVSFKUC4RFPM3VEXAM5ZTLKQ6XWE7FYPL3M2N4D0WALT"

// Owner addresses reused across safes
const PRIYA = "GBKM2P7RQXLF4ZTH9WVUC3JDNE6YSXAMPLE8LPQ2RT5VK7WBN4DXCORE"
const MARCUS = "GDLT8XWQ3RKM5PVNH2ZJ4FCUE7YBSAMPLE9TQL6RW2XVK5BN3DPGRWT"
const ELENA = "GAFR6PXM9WKL2TQVNH7ZJ3DCUE4YBSAMPLE5TQL8RW6XVK2BN9DPLEG"
const DAX = "GBNT4PXM2WKL9TQVNH5ZJ8DCUE3YBSAMPLE7TQL4RW2XVK6BN5DPENG"
const SAM = "GHST6PXM9WKL2TQVNH7ZJ3DCUE4YBSAMPLE5TQL8RW6XVK2BN9DPHOST"

const daysFromNow = (d: number) => new Date(Date.now() + d * 86400000).toISOString()
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString()
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString()

export const initialSafes: Safe[] = [
  {
    id: "treasury",
    name: "Nova DAO Treasury",
    address: "CQRMTREASURY7XJ4KLP2WQ9ZVNH3GTYUEXAMPLE6BFDC8MA5RSXNVQ2",
    threshold: 3,
    createdAt: daysAgo(214),
    owners: [
      { address: CURRENT_USER, label: "You" },
      { address: PRIYA, label: "Priya — Core" },
      { address: MARCUS, label: "Marcus — Ops" },
      { address: ELENA, label: "Elena — Legal" },
      { address: DAX, label: "Dax — Eng" },
    ],
    balances: [
      { token: "USDC", amount: 482350.12, usdValue: 482350.12 },
      { token: "XLM", amount: 1250000, usdValue: 137500 },
      { token: "AQUA", amount: 8400000, usdValue: 25200 },
    ],
    policies: [
      {
        id: "pol-1",
        safeId: "treasury",
        beneficiary: MARCUS,
        token: "USDC",
        limit: 5000,
        spent: 1850,
        period: "monthly",
        resetsAt: daysFromNow(12),
        enabled: true,
      },
      {
        id: "pol-2",
        safeId: "treasury",
        beneficiary: DAX,
        token: "XLM",
        limit: 20000,
        spent: 20000,
        period: "monthly",
        resetsAt: daysFromNow(12),
        enabled: true,
      },
    ],
    transactions: [
      {
        id: "tx-101",
        safeId: "treasury",
        nonce: 42,
        to: "GCONTRIB5PXM9WKL2TQVNH7ZJ3DCUE4YBSAMPLE5TQL8RW6XVK2GRANT",
        token: "USDC",
        amount: 45000,
        description: "Q3 grants disbursement — Cohort 4",
        status: "pending",
        proposedBy: PRIYA,
        proposedAt: hoursAgo(6),
        approvals: [
          { owner: PRIYA, approvedAt: hoursAgo(6) },
          { owner: ELENA, approvedAt: hoursAgo(3) },
        ],
      },
      {
        id: "tx-102",
        safeId: "treasury",
        nonce: 43,
        to: "GVENDOR8XWQ3RKM5PVNH2ZJ4FCUE7YBSAMPLE9TQL6RW2XVK5INFRA",
        token: "XLM",
        amount: 85000,
        description: "Validator infrastructure — annual renewal",
        status: "ready",
        proposedBy: CURRENT_USER,
        proposedAt: daysAgo(1),
        approvals: [
          { owner: CURRENT_USER, approvedAt: daysAgo(1) },
          { owner: PRIYA, approvedAt: hoursAgo(20) },
          { owner: MARCUS, approvedAt: hoursAgo(14) },
        ],
      },
      {
        id: "tx-100",
        safeId: "treasury",
        nonce: 41,
        to: MARCUS,
        token: "USDC",
        amount: 1850,
        description: "Ops allowance — design tooling",
        status: "executed",
        viaPolicy: true,
        proposedBy: MARCUS,
        proposedAt: daysAgo(4),
        executedAt: daysAgo(4),
        executedBy: MARCUS,
        approvals: [],
      },
      {
        id: "tx-099",
        safeId: "treasury",
        nonce: 40,
        to: "GCONTRIB5PXM9WKL2TQVNH7ZJ3DCUE4YBSAMPLE5TQL8RW6XVK2GRANT",
        token: "USDC",
        amount: 120000,
        description: "Strategic partnership — milestone 1",
        status: "executed",
        proposedBy: PRIYA,
        proposedAt: daysAgo(9),
        executedAt: daysAgo(8),
        executedBy: CURRENT_USER,
        approvals: [
          { owner: PRIYA, approvedAt: daysAgo(9) },
          { owner: CURRENT_USER, approvedAt: daysAgo(8) },
          { owner: ELENA, approvedAt: daysAgo(8) },
        ],
      },
    ],
  },
  {
    id: "grants",
    name: "Ecosystem Grants",
    address: "CQRMGRANTS3RKM5PVNH2ZJ4FCUE7YBSAMPLE9TQL6RW2XVK5BN3DPXKZ",
    threshold: 2,
    createdAt: daysAgo(96),
    owners: [
      { address: CURRENT_USER, label: "You" },
      { address: PRIYA, label: "Priya — Core" },
      { address: SAM, label: "Sam — Community" },
    ],
    balances: [
      { token: "USDC", amount: 92000, usdValue: 92000 },
      { token: "XLM", amount: 310000, usdValue: 34100 },
    ],
    policies: [],
    transactions: [
      {
        id: "tx-201",
        safeId: "grants",
        nonce: 12,
        to: "GBUILDER8XWQ3RKM5PVNH2ZJ4FCUE7YBSAMPLE9TQL6RW2XVK5DEVKIT",
        token: "USDC",
        amount: 7500,
        description: "Wallet SDK bounty payout",
        status: "pending",
        proposedBy: SAM,
        proposedAt: hoursAgo(30),
        approvals: [{ owner: SAM, approvedAt: hoursAgo(30) }],
      },
    ],
  },
  {
    id: "ops",
    name: "Operations Wallet",
    address: "CQRMOPS9WKL2TQVNH7ZJ3DCUE4YBSAMPLE5TQL8RW6XVK2BN9DPLMNQ4",
    threshold: 2,
    createdAt: daysAgo(38),
    owners: [
      { address: CURRENT_USER, label: "You" },
      { address: MARCUS, label: "Marcus — Ops" },
      { address: DAX, label: "Dax — Eng" },
    ],
    balances: [
      { token: "USDC", amount: 18400, usdValue: 18400 },
      { token: "XLM", amount: 64000, usdValue: 7040 },
    ],
    policies: [
      {
        id: "pol-3",
        safeId: "ops",
        beneficiary: MARCUS,
        token: "USDC",
        limit: 2000,
        spent: 340,
        period: "weekly",
        resetsAt: daysFromNow(3),
        enabled: true,
      },
    ],
    transactions: [],
  },
]
