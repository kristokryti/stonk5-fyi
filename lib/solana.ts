import {
  ENGINE_WALLET,
  ISSUED_SUPPLY,
  MINT,
  ROUND_SOL_THRESHOLD,
  SOLANA_RPC_URL,
} from "./constants";
import type { HolderConcentration, OnchainStats } from "./types";

const RPC_TIMEOUT_MS = 8_000;
const LAMPORTS_PER_SOL = 1_000_000_000;

interface RpcResponseEntry {
  id: number;
  result?: unknown;
  error?: { message: string };
}

async function rpcBatch(
  calls: { method: string; params: unknown[] }[]
): Promise<unknown[]> {
  const res = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
    headers: { "content-type": "application/json" },
    body: JSON.stringify(
      calls.map((c, i) => ({ jsonrpc: "2.0", id: i, method: c.method, params: c.params }))
    ),
  });
  if (!res.ok) throw new Error(`Solana RPC batch responded ${res.status}`);
  const json = (await res.json()) as RpcResponseEntry[];
  const byId = new Map<number, RpcResponseEntry>(json.map((r) => [r.id, r]));
  return calls.map((_, i) => {
    const entry = byId.get(i);
    if (!entry) throw new Error("Solana RPC batch: missing response entry");
    if (entry.error) throw new Error(`Solana RPC: ${entry.error.message}`);
    return entry.result;
  });
}

// Cluster gap: consecutive engine-initiated transactions closer together
// than this are treated as part of the same round's payout burst (a round's
// reward distribution to holders is many small transfers, not one
// transaction). A gap larger than this marks the boundary before the round.
const ROUND_CLUSTER_GAP_SECONDS = 45 * 60;
const LAST_ROUND_CACHE_TTL_MS = 5 * 60 * 1000;

let lastRoundCache: { value: string | null; computedAt: number } | null = null;

// Some RPC providers (unlike the single-item batches used elsewhere in this
// file) reject or silently fail an overly large batched JSON-RPC request —
// this is the one place that needs dozens of getTransaction calls at once,
// so it's chunked into smaller requests rather than one giant POST.
const FEE_PAYER_CHUNK_SIZE = 20;

async function fetchFeePayersChunk(
  signatures: string[]
): Promise<{ blockTime: number | null; feePayer: string | null }[]> {
  const res = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
    headers: { "content-type": "application/json" },
    body: JSON.stringify(
      signatures.map((sig, i) => ({
        jsonrpc: "2.0",
        id: i,
        method: "getTransaction",
        params: [sig, { encoding: "json", maxSupportedTransactionVersion: 0 }],
      }))
    ),
  });
  if (!res.ok) throw new Error(`Solana RPC batch responded ${res.status}`);
  const json = (await res.json()) as RpcResponseEntry[];
  const byId = new Map<number, RpcResponseEntry>(json.map((r) => [r.id, r]));
  return signatures.map((_, i) => {
    const result = byId.get(i)?.result as
      | { blockTime?: number; transaction?: { message?: { accountKeys?: string[] } } }
      | undefined;
    if (!result) return { blockTime: null, feePayer: null };
    return {
      blockTime: result.blockTime ?? null,
      feePayer: result.transaction?.message?.accountKeys?.[0] ?? null,
    };
  });
}

async function fetchFeePayers(
  signatures: string[]
): Promise<{ blockTime: number | null; feePayer: string | null }[]> {
  const chunks: string[][] = [];
  for (let i = 0; i < signatures.length; i += FEE_PAYER_CHUNK_SIZE) {
    chunks.push(signatures.slice(i, i + FEE_PAYER_CHUNK_SIZE));
  }

  const results = await Promise.allSettled(chunks.map(fetchFeePayersChunk));
  return results.flatMap((r, i) =>
    r.status === "fulfilled"
      ? r.value
      // One chunk failing (rate limit, timeout) shouldn't sink the whole
      // window — those signatures are just excluded, same as a missing
      // individual entry.
      : chunks[i].map(() => ({ blockTime: null, feePayer: null }))
  );
}

// The countdown needs to know when the current round started. There's no
// single "round" transaction to look for: a round's 95% reward payout goes
// out as many separate transfers to holders, sent by the engine wallet over
// a span of time. We detect this by clustering the engine wallet's own
// recent transactions (where it's the fee payer, i.e. it initiated the tx —
// this excludes incoming trade-fee deposits from other wallets) and take the
// earliest timestamp in the most recent cluster as the round start. If we
// can't find any engine-initiated activity in the sampled window, we return
// null rather than guess — the UI shows "—" for the timer in that case.
async function getLastRoundTimestamp(): Promise<string | null> {
  const now = Date.now();
  if (lastRoundCache && now - lastRoundCache.computedAt < LAST_ROUND_CACHE_TTL_MS) {
    return lastRoundCache.value;
  }

  try {
    const [sigResult] = await rpcBatch([
      { method: "getSignaturesForAddress", params: [ENGINE_WALLET, { limit: 100 }] },
    ]);
    const signatures: string[] = ((sigResult as { signature: string }[] | null) ?? []).map(
      (s) => s.signature
    );
    if (signatures.length === 0) {
      lastRoundCache = { value: null, computedAt: now };
      return null;
    }

    const txs = await fetchFeePayers(signatures);

    // If every single transaction in the batch came back without a blockTime,
    // that's not "no recent round" — it's the batch fetch itself failing
    // wholesale (rate limit, RPC hiccup). Treat it like the catch block below
    // instead of caching a false negative.
    if (txs.every((t) => t.blockTime === null)) {
      return lastRoundCache?.value ?? null;
    }

    const engineTimestamps = txs
      .filter((t) => t.feePayer === ENGINE_WALLET && t.blockTime !== null)
      .map((t) => t.blockTime as number)
      .sort((a, b) => b - a);

    if (engineTimestamps.length === 0) {
      lastRoundCache = { value: null, computedAt: now };
      return null;
    }

    let clusterStart = engineTimestamps[0];
    for (let i = 1; i < engineTimestamps.length; i++) {
      const gap = engineTimestamps[i - 1] - engineTimestamps[i];
      if (gap > ROUND_CLUSTER_GAP_SECONDS) break;
      clusterStart = engineTimestamps[i];
    }

    const value = new Date(clusterStart * 1000).toISOString();
    lastRoundCache = { value, computedAt: now };
    return value;
  } catch {
    // Keep serving the last good value on a transient RPC failure instead
    // of flashing "—" every time the public/rate-limited RPC hiccups.
    return lastRoundCache?.value ?? null;
  }
}

async function getHolderConcentration(
  totalSupplyUi: number
): Promise<HolderConcentration | null> {
  try {
    const [result] = await rpcBatch([
      { method: "getTokenLargestAccounts", params: [MINT] },
    ]);
    const value = (result as { value?: { uiAmount: number | null }[] } | undefined)?.value;
    const accounts: { uiAmount: number | null }[] = (value ?? []).slice(0, 10);
    if (accounts.length === 0 || totalSupplyUi === 0) return null;
    const topSum = accounts.reduce((sum, a) => sum + (a.uiAmount ?? 0), 0);
    return {
      topHolderPercent: (topSum / totalSupplyUi) * 100,
      accountsSampled: accounts.length,
    };
  } catch {
    return null;
  }
}

export async function getOnchainStats(): Promise<OnchainStats> {
  const [supplyResultRaw, balanceResultRaw, mintAccountResultRaw] = await rpcBatch([
    { method: "getTokenSupply", params: [MINT] },
    { method: "getBalance", params: [ENGINE_WALLET] },
    { method: "getAccountInfo", params: [MINT, { encoding: "jsonParsed" }] },
  ]);

  const supplyResult = supplyResultRaw as { value?: { uiAmount?: number } } | undefined;
  const balanceResult = balanceResultRaw as { value?: number } | undefined;
  const mintAccountResult = mintAccountResultRaw as
    | { value?: { data?: { parsed?: { info?: { mintAuthority: unknown; freezeAuthority: unknown } } } } }
    | undefined;

  const totalSupply = Number(supplyResult?.value?.uiAmount ?? 0);
  const burnedTokens = Math.max(0, ISSUED_SUPPLY - totalSupply);
  const burnedPercent = (burnedTokens / ISSUED_SUPPLY) * 100;

  const engineWalletSol = Number(balanceResult?.value ?? 0) / LAMPORTS_PER_SOL;
  const roundProgressPercent = Math.min(
    100,
    (engineWalletSol / ROUND_SOL_THRESHOLD) * 100
  );

  const mintInfo = mintAccountResult?.value?.data?.parsed?.info;

  // Holder concentration and last-round detection are fetched separately
  // and allowed to fail on their own (both hit the RPC harder than the core
  // calls above) without losing supply/authority data.
  const [holderConcentration, lastRoundTimestamp] = await Promise.all([
    getHolderConcentration(totalSupply),
    getLastRoundTimestamp(),
  ]);

  return {
    totalSupply,
    burnedTokens,
    burnedPercent,
    engineWalletSol,
    roundProgressPercent,
    mintAuthorityRenounced: mintInfo?.mintAuthority === null,
    freezeAuthorityRenounced: mintInfo?.freezeAuthority === null,
    holderConcentration,
    lastRoundTimestamp,
  };
}
