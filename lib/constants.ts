export const MINT = "F7CTvENFnkDJysMhaFFicDT2FwnbW2oasFZGG6WJnar7";
export const PAIR_ADDRESS = "Yu7b2bVsMtvuJQTFihKmrxLeexFNo9LP8FzUo9psckr";
export const DEX_CHAIN = "solana";

export const STONKFUN_API_BASE =
  process.env.STONKFUN_API_BASE ?? "https://www.stonkfun.xyz/api/public/v1";
export const DEXSCREENER_API_BASE =
  process.env.DEXSCREENER_API_BASE ?? "https://api.dexscreener.com/latest/dex";

export const LINKS = {
  website: "https://stonk5.com/",
  twitter: "https://x.com/stonk5onsf",
  stonkfun: `https://www.stonkfun.xyz/token/${MINT}`,
  dexscreener: `https://dexscreener.com/${DEX_CHAIN}/${PAIR_ADDRESS}`,
};

export const SITE_NAME = "Stonk5 Tracker";
export const REFRESH_INTERVAL_MS = 30_000;
