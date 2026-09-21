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
