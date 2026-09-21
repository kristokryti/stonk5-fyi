export const MINT = "F7CTvENFnkDJysMhaFFicDT2FwnbW2oasFZGG6WJnar7";
export const PAIR_ADDRESS = "Yu7b2bVsMtvuJQTFihKmrxLeexFNo9LP8FzUo9psckr";
export const DEX_CHAIN = "solana";

// The wallet the STONK5 engine collects creator fees into and runs
// buy-basket + burn + payout rounds from. Public per stonk5.com.
export const ENGINE_WALLET = "gPYVhFeYVrfbAruwNVZthfnVdeWjgBUiaSabdpn77B6";
export const ISSUED_SUPPLY = 1_000_000_000;
export const ROUND_SOL_THRESHOLD = 5;
export const ROUND_MAX_HOURS = 5;
// Rent reserve the engine wallet keeps for opening the payout token accounts
// each round — per stonk5.com's own explainer, this (plus a variable manual
// top-up we have no way to read) sits in the wallet on top of the SOL that
// actually counts toward the round threshold. Only the rent portion is a
// fixed, non-arbitrary amount we can subtract with confidence.
export const ROUND_RENT_RESERVE_SOL = 0.1;

export const STONKFUN_API_BASE =
  process.env.STONKFUN_API_BASE ?? "https://www.stonkfun.xyz/api/public/v1";
export const DEXSCREENER_API_BASE =
  process.env.DEXSCREENER_API_BASE ?? "https://api.dexscreener.com/latest/dex";
export const SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

export const LINKS = {
  website: "https://stonk5.com/",
  claims: "https://stonk5.com/claims",
  burnLock: "https://stonk5.com/burn-lock",
  twitter: "https://x.com/stonk5onsf",
  siteTwitter: "https://x.com/stonk5_fyi",
  stonkfun: `https://www.stonkfun.xyz/token/${MINT}`,
  stonkfunToken: (mint: string) => `https://www.stonkfun.xyz/token/${mint}`,
  dexscreener: `https://dexscreener.com/${DEX_CHAIN}/${PAIR_ADDRESS}`,
  solscanToken: `https://solscan.io/token/${MINT}`,
  solscanEngineWallet: `https://solscan.io/account/${ENGINE_WALLET}`,
};

export const SITE_NAME = "Stonk5 Tracker";
export const REFRESH_INTERVAL_MS = 30_000;
