import {
  ENGINE_WALLET,
  ISSUED_SUPPLY,
  MINT,
  ROUND_SOL_THRESHOLD,
  SOLANA_RPC_URL,
} from "./constants";
import type { OnchainStats } from "./types";

const RPC_TIMEOUT_MS = 8_000;
const LAMPORTS_PER_SOL = 1_000_000_000;

async function rpc(method: string, params: unknown[]): Promise<any> {
  const res = await fetch(SOLANA_RPC_URL, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`Solana RPC ${method} responded ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`Solana RPC ${method}: ${json.error.message}`);
  return json.result;
}

export async function getOnchainStats(): Promise<OnchainStats> {
  const [supplyResult, balanceResult] = await Promise.all([
    rpc("getTokenSupply", [MINT]),
    rpc("getBalance", [ENGINE_WALLET]),
  ]);

  const totalSupply = Number(supplyResult?.value?.uiAmount ?? 0);
  const burnedTokens = Math.max(0, ISSUED_SUPPLY - totalSupply);
  const burnedPercent = (burnedTokens / ISSUED_SUPPLY) * 100;

  const engineWalletSol = Number(balanceResult ?? 0) / LAMPORTS_PER_SOL;
  const roundProgressPercent = Math.min(
    100,
    (engineWalletSol / ROUND_SOL_THRESHOLD) * 100
  );

  return {
    totalSupply,
    burnedTokens,
    burnedPercent,
    engineWalletSol,
    roundProgressPercent,
  };
}
