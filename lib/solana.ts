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

async function rpcBatch(
  calls: { method: string; params: unknown[] }[]
): Promise<any[]> {
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
  const json = await res.json();
  const byId = new Map<number, any>(json.map((r: any) => [r.id, r]));
  return calls.map((_, i) => {
    const entry = byId.get(i);
    if (!entry) throw new Error("Solana RPC batch: missing response entry");
    if (entry.error) throw new Error(`Solana RPC: ${entry.error.message}`);
    return entry.result;
  });
}

async function getHolderConcentration(
  totalSupplyUi: number
): Promise<HolderConcentration | null> {
  try {
    const [result] = await rpcBatch([
      { method: "getTokenLargestAccounts", params: [MINT] },
    ]);
    const accounts: { uiAmount: number | null }[] = result?.value ?? [];
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
  const [supplyResult, balanceResult, mintAccountResult] = await rpcBatch([
    { method: "getTokenSupply", params: [MINT] },
    { method: "getBalance", params: [ENGINE_WALLET] },
    { method: "getAccountInfo", params: [MINT, { encoding: "jsonParsed" }] },
  ]);

  const totalSupply = Number(supplyResult?.value?.uiAmount ?? 0);
  const burnedTokens = Math.max(0, ISSUED_SUPPLY - totalSupply);
  const burnedPercent = (burnedTokens / ISSUED_SUPPLY) * 100;

  const engineWalletSol = Number(balanceResult?.value ?? 0) / LAMPORTS_PER_SOL;
  const roundProgressPercent = Math.min(
    100,
    (engineWalletSol / ROUND_SOL_THRESHOLD) * 100
  );

  const mintInfo = mintAccountResult?.value?.data?.parsed?.info;

  // Holder concentration is fetched separately and allowed to fail on its
  // own (public RPC rate-limits getTokenLargestAccounts more aggressively
  // than the core calls above) without losing supply/authority data.
  const holderConcentration = await getHolderConcentration(totalSupply);

  return {
    totalSupply,
    burnedTokens,
    burnedPercent,
    engineWalletSol,
    roundProgressPercent,
    mintAuthorityRenounced: mintInfo?.mintAuthority === null,
    freezeAuthorityRenounced: mintInfo?.freezeAuthority === null,
    holderConcentration,
  };
}
