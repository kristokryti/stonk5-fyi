export const MINT = "F7CTvENFnkDJysMhaFFicDT2FwnbW2oasFZGG6WJnar7";
export const PAIR_ADDRESS = "Yu7b2bVsMtvuJQTFihKmrxLeexFNo9LP8FzUo9psckr";
export const DEX_CHAIN = "solana";
export const SOL_MINT = "So11111111111111111111111111111111111111112";

// Jupiter referral program (https://referral.jup.ag/) — once a referral
// account + SOL referral-token-account exist there, set these so the
// "Trade $STONK5" links route swaps through it and earn a fee. Left unset,
// the links fall back to a plain jup.ag swap page with no referral fee.
export const JUP_REFERRAL_ACCOUNT = process.env.NEXT_PUBLIC_JUP_REFERRAL_ACCOUNT || null;
export const JUP_REFERRAL_FEE_BPS = process.env.NEXT_PUBLIC_JUP_REFERRAL_FEE_BPS || "100";

// The wallet the STONK5 engine collects creator fees into and runs
// buy-basket + burn + payout rounds from. Public per stonk5.com.
export const ENGINE_WALLET = "gPYVhFeYVrfbAruwNVZthfnVdeWjgBUiaSabdpn77B6";
export const ISSUED_SUPPLY = 1_000_000_000;
export const ROUND_SOL_THRESHOLD = 5;
export const ROUND_MAX_HOURS = 5;
// stonk5.com's own engine still holds off firing a round once the 5-hour
// timer is up until its reserve covers this much SOL for round costs
// (observed live value; used only if /api/payout ever omits the field).
export const ROUND_MIN_BUDGET_SOL_FALLBACK = 0.5;
export const MIN_QUALIFY_TOKENS = 50_000;
export const MIN_QUALIFY_USD = 20;
// 18% x 5 basket slots — the rest of a round's fees go to burn (5%) and lock (5%).
export const BASKET_SHARE_OF_ROUND = 0.9;
// How many recent real rounds the average-fees-per-round estimate is based on.
export const ROUND_HISTORY_SAMPLE_SIZE = 10;

export const STONKFUN_API_BASE =
  process.env.STONKFUN_API_BASE ?? "https://www.stonkfun.xyz/api/public/v1";
export const DEXSCREENER_API_BASE =
  process.env.DEXSCREENER_API_BASE ?? "https://api.dexscreener.com/latest/dex";
export const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
// stonk5.com's own public engine API — its /api/payout endpoint is the
// authoritative source for the round-trigger reserve/progress/timer (the
// engine's own bookkeeping distinguishes "buying reserve" from rent and
// manual top-ups in a way that can't be reconstructed from the wallet's raw
// on-chain balance alone). Referenced directly in stonk5.com's own page.
export const STONK5_API_BASE = process.env.STONK5_API_BASE ?? "https://stonk5.com/api";
// GeckoTerminal's public DEX API — free, documented, no key required
// (https://www.geckoterminal.com/dex-api). Used for chart OHLCV and for
// per-wallet buyer/seller counts, which DexScreener's public API doesn't
// expose (only transaction counts).
export const GECKOTERMINAL_API_BASE =
  process.env.GECKOTERMINAL_API_BASE ?? "https://api.geckoterminal.com/api/v2";
// Birdeye's API — used only for a real 24h buy/sell USD volume split
// (GeckoTerminal's free tier can't provide one, see fetchStats.ts). Requires
// BIRDEYE_API_KEY; the trade-volume fetch is skipped entirely without it.
export const BIRDEYE_API_BASE =
  process.env.BIRDEYE_API_BASE ?? "https://public-api.birdeye.so";

export const LINKS = {
  website: "https://stonk5.com/",
  claims: "https://stonk5.com/claims",
  burnLock: "https://stonk5.com/burn-lock",
  twitter: "https://x.com/stonk5onsf",
  siteTwitter: "https://x.com/stonk5_fyi",
  stonkfun: `https://www.stonkfun.xyz/token/${MINT}`,
  stonkfunToken: (mint: string) => `https://www.stonkfun.xyz/token/${mint}`,
  jupiterSwap:
    `https://jup.ag/?sell=${SOL_MINT}&buy=${MINT}` +
    (JUP_REFERRAL_ACCOUNT
      ? `&referrer=${JUP_REFERRAL_ACCOUNT}&feeBps=${JUP_REFERRAL_FEE_BPS}`
      : ""),
  dexscreener: `https://dexscreener.com/${DEX_CHAIN}/${PAIR_ADDRESS}`,
  solscanToken: `https://solscan.io/token/${MINT}`,
  solscanEngineWallet: `https://solscan.io/account/${ENGINE_WALLET}`,
};

export const SITE_NAME = "Stonk5 Tracker";
export const REFRESH_INTERVAL_MS = 30_000;
