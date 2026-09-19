export type StatsSource = "stonkfun" | "dexscreener";

export interface BurnTotals {
  amountTokens: number;
  valueUsdAtBurn: number;
  burnCount: number;
}

export interface TokenStats {
  source: StatsSource;
  name: string;
  symbol: string;
  imageUrl: string | null;
  priceUsd: number;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange24h: number | null;
  peakMarketCapUsd: number | null;
  status: string | null;
  graduationProgress: number | null;
  burns: BurnTotals | null;
  updatedAt: string;
  warning?: string;
}
