export interface TimeframeStats {
  m5: number | null;
  h1: number | null;
  h6: number | null;
  h24: number | null;
}

export interface HolderConcentration {
  topHolderPercent: number;
  accountsSampled: number;
}

export interface OnchainStats {
  totalSupply: number;
  burnedTokens: number;
  burnedPercent: number;
  engineWalletSol: number;
  roundProgressPercent: number;
  mintAuthorityRenounced: boolean;
  freezeAuthorityRenounced: boolean;
  holderConcentration: HolderConcentration | null;
  lastRoundTimestamp: string | null;
  lockedTokens: number | null;
  inVaultTokens: number | null;
}

export interface LaunchInfo {
  creator: string;
  createdAt: string;
  graduatedAt: string | null;
  startMarketCapUsd: number | null;
}

export interface BasketToken {
  mint: string;
  name: string;
  symbol: string;
  imageUrl: string | null;
  marketCapUsd: number | null;
  priceChange24h: number | null;
}

export interface ClaimsRuleInfo {
  minBalanceTokens: number;
  minBalanceUsd: number;
  maxBalanceTokens: number;
  floorTokens: number;
  rewardTokenDecimals: number;
  rentSol: number;
  rentMultiple: number;
  maxCostRatioBps: number;
  maxAccumulationSeconds: number;
  buyTriggerSol: number;
}

export interface ClaimsTokenMeta {
  symbol: string;
  name: string;
  decimals: number;
  transferFeeBps: number;
  priceUsd: number;
  imageUrl?: string | null;
}

export interface ClaimsReceivedEntry {
  netRaw: string;
  count: number;
  last: { signature: string; ts: string };
}

export interface ClaimsOpenEntry {
  grossRaw: string;
  netRaw: string;
  valueUsd: number;
  status: string;
  detail: string;
  needsAccount: boolean;
  floorUsd: number;
}

export interface ClaimsPayoutEntry {
  mint: string;
  netRaw: string;
  signature: string;
  ts: string;
}

export interface ClaimsHolder {
  balanceRaw: string;
  averageRaw: string;
  eligible: boolean;
  reason: string | null;
  open: Record<string, ClaimsOpenEntry>;
  received: Record<string, ClaimsReceivedEntry>;
  payouts: ClaimsPayoutEntry[];
}

// From stonk5.com's own /api/claims?wallet=<address> endpoint — the
// authoritative source for what a wallet has actually received, judged by
// the engine's own rules. We proxy it server-side (no CORS headers on
// their end) and enrich `tokens[].imageUrl` from stonkfun ourselves.
export interface ClaimsResponse {
  wallet: string;
  generatedAt: string;
  rule: ClaimsRuleInfo;
  cycle: { from: string; to: string; lastRoundAt: string | null };
  counts: {
    holders: number;
    everHeld: number;
    eligible: number;
    owed: number;
    paid: number;
  };
  tokens: Record<string, ClaimsTokenMeta>;
  holder: ClaimsHolder | null;
  stale: boolean;
}

export interface TokenStats {
  name: string;
  symbol: string;
  imageUrl: string | null;

  priceUsd: number;
  priceSol: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange: TimeframeStats | null;
  volume: TimeframeStats | null;
  txns24h: { buys: number; sells: number } | null;

  peakMarketCapUsd: number | null;
  status: string | null;
  graduationProgress: number | null;
  launch: LaunchInfo | null;

  onchain: OnchainStats | null;
  basket: BasketToken[] | null;
  basketAvgChange24h: number | null;
  basketTotalMarketCapUsd: number | null;

  updatedAt: string;
  warnings: string[];
}
