export interface TimeframeStats {
  m5: number | null;
  h1: number | null;
  h6: number | null;
  h24: number | null;
}

// From GeckoTerminal's pool endpoint — the only source we found with
// unique buyer/seller wallet counts, not just transaction counts.
export interface Traders24hStats {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

// Real buy/sell USD volume split over a full 24h window, from Birdeye's
// trade-data endpoint. Only ever populated when that's true 24h data —
// there's no fallback to a shorter/partial window, so this is either a real
// 24h figure or null.
export interface RecentTradeVolumeStats {
  buyUsd: number;
  sellUsd: number;
  tradeCount: number;
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
  avgRoundSol: number | null;
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
  priceUsd: number | null;
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
  // null for a "ready" entry — it already clears the floor, so there's no
  // threshold left to report.
  floorUsd: number | null;
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
  traders24h: Traders24hStats | null;
  recentTradeVolume: RecentTradeVolumeStats | null;

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
