import {
  BASKET_SHARE_OF_ROUND,
  BIRDEYE_API_BASE,
  DEX_CHAIN,
  DEXSCREENER_API_BASE,
  GECKOTERMINAL_API_BASE,
  MINT,
  PAIR_ADDRESS,
  ROUND_HISTORY_SAMPLE_SIZE,
  STONK5_API_BASE,
  STONKFUN_API_BASE,
} from "./constants";
import { getOnchainStats } from "./solana";
import basketFallbackData from "./basketFallback.json";
import { resolveTokenImage } from "./tokenImageOverrides";
import type {
  BasketToken,
  LaunchInfo,
  OnchainStats,
  RecentTradeVolumeStats,
  TimeframeStats,
  TokenStats,
  Traders24hStats,
} from "./types";

const FETCH_TIMEOUT_MS = 8_000;

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.json();
}

// A handful of third-party fetches (stonkfun launch metadata, stonk5.com's
// lock/rounds history) each fail independently on an occasional single
// request. Falling back to a recent successful result — instead of losing
// that field for this response — covers both the recurring poll and,
// unlike a client-only fix, the very first page load too, where there's no
// previous client state to fall back to yet.
const staleFallbackCache = new Map<string, { value: unknown; at: number }>();
const STALE_FALLBACK_MAX_AGE_MS = 10 * 60 * 1000;

async function withStaleFallback<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  try {
    const value = await fetcher();
    staleFallbackCache.set(key, { value, at: Date.now() });
    return value;
  } catch (err) {
    const cached = staleFallbackCache.get(key);
    if (cached && Date.now() - cached.at < STALE_FALLBACK_MAX_AGE_MS) {
      return cached.value as T;
    }
    throw err;
  }
}

interface DexData {
  priceUsd: number;
  priceSol: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange: TimeframeStats;
  volume: TimeframeStats;
  imageUrl: string | null;
  name: string;
  symbol: string;
}

interface DexPair {
  pairAddress: string;
  priceUsd?: string | number;
  priceNative?: string | number;
  marketCap?: number;
  fdv?: number;
  liquidity?: { usd?: number };
  volume?: { m5?: number; h1?: number; h6?: number; h24?: number };
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  info?: { imageUrl?: string };
  baseToken?: { name?: string; symbol?: string };
}

async function fetchDexscreener(): Promise<DexData> {
  const json = (await fetchJson(`${DEXSCREENER_API_BASE}/tokens/${MINT}`)) as {
    pairs?: DexPair[];
  };
  const pairs = json.pairs ?? [];
  const pair =
    pairs.find((p) => p.pairAddress === PAIR_ADDRESS) ??
    pairs.sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];

  if (!pair) throw new Error("dexscreener: no pairs found");

  return {
    priceUsd: Number(pair.priceUsd ?? 0),
    priceSol: pair.priceNative ? Number(pair.priceNative) : null,
    marketCapUsd: pair.marketCap ?? null,
    fdvUsd: pair.fdv ?? null,
    liquidityUsd: pair.liquidity?.usd ?? null,
    volume24hUsd: pair.volume?.h24 ?? null,
    priceChange: {
      m5: pair.priceChange?.m5 ?? null,
      h1: pair.priceChange?.h1 ?? null,
      h6: pair.priceChange?.h6 ?? null,
      h24: pair.priceChange?.h24 ?? null,
    },
    volume: {
      m5: pair.volume?.m5 ?? null,
      h1: pair.volume?.h1 ?? null,
      h6: pair.volume?.h6 ?? null,
      h24: pair.volume?.h24 ?? null,
    },
    imageUrl: pair.info?.imageUrl ?? null,
    name: pair.baseToken?.name ?? "Stonk5 Index",
    symbol: pair.baseToken?.symbol ?? "STONK5",
  };
}

interface StonkfunMeta {
  name: string;
  symbol: string;
  imageUrl: string | null;
  priceUsd: number;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  peakMarketCapUsd: number | null;
  status: string | null;
  graduationProgress: number | null;
  launch: LaunchInfo | null;
}

interface StonkfunTokenResponse {
  data?: {
    token?: {
      name?: string;
      symbol?: string;
      imageUrl?: string;
      createdAt?: string;
      graduatedAt?: string | null;
      status?: string;
      graduationProgress?: number;
      market?: {
        priceUsd?: number;
        marketCapUsd?: number;
        fdvUsd?: number;
        liquidityUsd?: number;
        volume24hUsd?: number;
        peakMarketCapUsd?: number;
      };
    };
    launch?: {
      creator?: string;
      createdAt?: string;
      startMarketCapUsd?: number;
    };
  };
}

async function fetchStonkfunMeta(): Promise<StonkfunMeta> {
  return withStaleFallback("stonkfunMeta", () => fetchStonkfunMetaLive());
}

async function fetchStonkfunMetaLive(): Promise<StonkfunMeta> {
  const tokenRes = (await fetchJson(
    `${STONKFUN_API_BASE}/tokens/${MINT}`
  )) as StonkfunTokenResponse;
  const token = tokenRes?.data?.token;
  const launchRecord = tokenRes?.data?.launch;
  if (!token) throw new Error("stonkfun: unexpected response shape");

  return {
    name: token.name ?? "Stonk5 Index",
    symbol: token.symbol ?? "STONK5",
    imageUrl: token.imageUrl ?? null,
    priceUsd: Number(token.market?.priceUsd ?? 0),
    marketCapUsd: token.market?.marketCapUsd ?? null,
    fdvUsd: token.market?.fdvUsd ?? null,
    liquidityUsd: token.market?.liquidityUsd ?? null,
    volume24hUsd: token.market?.volume24hUsd ?? null,
    peakMarketCapUsd: token.market?.peakMarketCapUsd ?? null,
    status: token.status ?? null,
    graduationProgress: token.graduationProgress ?? null,
    launch: launchRecord
      ? {
          creator: launchRecord.creator ?? "",
          createdAt: launchRecord.createdAt ?? token.createdAt ?? "",
          graduatedAt: token.graduatedAt ?? null,
          startMarketCapUsd: launchRecord.startMarketCapUsd ?? null,
        }
      : null,
  };
}

interface StonkfunBasketToken {
  mint: string;
  name?: string;
  symbol: string;
  imageUrl?: string;
  market?: { marketCapUsd?: number; priceChange24h?: number; priceUsd?: number };
}

async function fetchBasket(): Promise<BasketToken[]> {
  return withStaleFallback("basket", () => fetchBasketLive());
}

async function fetchBasketLive(): Promise<BasketToken[]> {
  const json = (await fetchJson(`${STONKFUN_API_BASE}/tokens?sort=marketCap&pageSize=5`)) as {
    data?: { tokens?: StonkfunBasketToken[] };
  };
  const tokens = json.data?.tokens ?? [];
  return tokens.slice(0, 5).map((t) => ({
    mint: t.mint,
    name: t.name ?? t.symbol,
    symbol: t.symbol,
    imageUrl: t.imageUrl
      ? t.imageUrl.startsWith("http")
        ? t.imageUrl
        : `https://www.stonkfun.xyz${t.imageUrl}`
      : null,
    marketCapUsd: t.market?.marketCapUsd ?? null,
    priceChange24h: t.market?.priceChange24h ?? null,
    priceUsd: t.market?.priceUsd ?? null,
  }));
}

// Ultimate fallback when stonkfun's tokens-list is unreachable and no
// recent stale value is cached either (e.g. a sustained outage spanning
// this whole server's uptime). Backed by a local snapshot of the top ~30
// tokens' mint/name/symbol + logo, refreshed occasionally by
// scripts/refresh-basket-fallback.mjs — see lib/basketFallback.json. No
// market cap/price/24h change: those would just be stale numbers dressed
// up as live ones, so they're left null rather than invented.
function basketFromLocalSnapshot(): BasketToken[] {
  return basketFallbackData.tokens.slice(0, 5).map((t) => ({
    mint: t.mint,
    name: t.name,
    symbol: t.symbol,
    imageUrl: t.imageFile ? `/token-fallback/${t.imageFile}` : null,
    marketCapUsd: null,
    priceChange24h: null,
    priceUsd: null,
  }));
}

function applyImageOverrides(basket: BasketToken[]): BasketToken[] {
  return basket.map((t) => ({ ...t, imageUrl: resolveTokenImage(t.mint, t.imageUrl) }));
}

function pctDiff(a: number | null, b: number | null): number | null {
  if (a === null || b === null || a === 0) return null;
  return (Math.abs(a - b) / Math.abs(a)) * 100;
}

interface StonkPayoutResponse {
  walletSol?: number;
  reserveSol?: number;
  progress?: number;
  triggerSol?: number;
  accumulationStartedAt?: number;
  lastRoundAt?: number;
  clockKnown?: boolean;
}

interface EnginePayoutData {
  walletSol: number;
  reserveSol: number;
  roundProgressPercent: number;
  lastRoundTimestamp: string | null;
}

// stonk5.com's own engine bookkeeping — the authoritative source for the
// round-trigger reserve/progress/timer, since the split between "buying
// reserve", rent, and hand-topped-up SOL isn't reconstructable from the
// wallet's raw on-chain balance alone (verified: neither portion is a fixed
// amount round to round).
async function fetchEnginePayout(): Promise<EnginePayoutData> {
  const json = (await fetchJson(`${STONK5_API_BASE}/payout`)) as StonkPayoutResponse;
  if (json.walletSol === undefined || json.reserveSol === undefined) {
    throw new Error("stonk5 payout: unexpected response shape");
  }
  const startedAtMs = json.accumulationStartedAt ?? json.lastRoundAt ?? null;
  return {
    walletSol: json.walletSol,
    reserveSol: json.reserveSol,
    roundProgressPercent: json.progress !== undefined ? json.progress * 100 : 0,
    lastRoundTimestamp:
      json.clockKnown !== false && startedAtMs !== null
        ? new Date(startedAtMs).toISOString()
        : null,
  };
}

interface StonkLockResponse {
  inVault?: number;
  locked?: number;
}

interface EngineLockData {
  lockedTokens: number;
  inVaultTokens: number;
}

// stonk5.com's own lock-vault bookkeeping — "locked" (in a Jupiter Lock
// escrow, unreachable for 5 years) and "in vault" (bought, waiting for the
// weekly sweep into a lock) are two figures that only exist in the engine's
// own records, not derivable from the mint account the way burns are.
async function fetchEngineLock(): Promise<EngineLockData> {
  return withStaleFallback("engineLock", async () => {
    const json = (await fetchJson(`${STONK5_API_BASE}/lock`)) as StonkLockResponse;
    if (json.inVault === undefined || json.locked === undefined) {
      throw new Error("stonk5 lock: unexpected response shape");
    }
    return { lockedTokens: json.locked, inVaultTokens: json.inVault };
  });
}

interface GeckoPoolResponse {
  data?: {
    attributes?: {
      transactions?: {
        h24?: { buys?: number; sells?: number; buyers?: number; sellers?: number };
      };
    };
  };
}

// GeckoTerminal's pool endpoint — the only source we found that reports
// unique buyer/seller wallet counts rather than just transaction counts
// (DexScreener's public API only has the latter).
async function fetchGeckoTraders(): Promise<Traders24hStats | null> {
  return withStaleFallback("geckoTraders", async () => {
    const json = (await fetchJson(
      `${GECKOTERMINAL_API_BASE}/networks/${DEX_CHAIN}/pools/${PAIR_ADDRESS}`
    )) as GeckoPoolResponse;
    const h24 = json.data?.attributes?.transactions?.h24;
    if (
      h24?.buys === undefined ||
      h24?.sells === undefined ||
      h24?.buyers === undefined ||
      h24?.sellers === undefined
    ) {
      throw new Error("geckoterminal pool: unexpected response shape");
    }
    return { buys: h24.buys, sells: h24.sells, buyers: h24.buyers, sellers: h24.sellers };
  });
}

interface BirdeyeTradeData {
  volume_buy_24h_usd?: number;
  volume_sell_24h_usd?: number;
  buy_24h_count?: number;
  sell_24h_count?: number;
}
interface BirdeyeTradeDataResponse {
  success?: boolean;
  data?: BirdeyeTradeData;
}

// Birdeye's trade-data endpoint is the only source found that reports a
// real buy/sell USD split over an actual 24h window (GeckoTerminal's free
// tier only exposes buy/sell *counts* for 24h, and its trades endpoint that
// has real USD amounts is capped at ~300 trades — nowhere near 24h on an
// active pool). Its free tier's request rate and monthly compute-unit
// budget are both easy to blow through by calling it on every /api/stats
// poll from every visitor, and this stat doesn't need sub-minute freshness
// anyway — so refetch at most once per BIRDEYE_MIN_INTERVAL_MS, and on
// failure (quota exhausted, rate limited, transient outage) keep serving
// the last real 24h split for up to BIRDEYE_STALE_MAX_AGE_MS rather than
// showing nothing or a number that isn't actually a 24h window.
const BIRDEYE_MIN_INTERVAL_MS = 10 * 60 * 1000;
const BIRDEYE_STALE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

async function fetchBirdeyeTradeVolume(): Promise<RecentTradeVolumeStats | null> {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) return null;

  const cached = staleFallbackCache.get("birdeyeTradeVolume") as
    | { value: RecentTradeVolumeStats; at: number }
    | undefined;
  if (cached && Date.now() - cached.at < BIRDEYE_MIN_INTERVAL_MS) {
    return cached.value;
  }

  try {
    const res = await fetch(
      `${BIRDEYE_API_BASE}/defi/v3/token/trade-data/single?address=${MINT}`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          accept: "application/json",
          "x-chain": DEX_CHAIN,
          "X-API-KEY": apiKey,
        },
      }
    );
    if (!res.ok) throw new Error(`birdeye trade-data responded ${res.status}`);
    const json = (await res.json()) as BirdeyeTradeDataResponse;
    const d = json.data;
    if (d?.volume_buy_24h_usd === undefined || d?.volume_sell_24h_usd === undefined) {
      throw new Error("birdeye trade-data: unexpected response shape");
    }

    const value: RecentTradeVolumeStats = {
      buyUsd: d.volume_buy_24h_usd,
      sellUsd: d.volume_sell_24h_usd,
      tradeCount: (d.buy_24h_count ?? 0) + (d.sell_24h_count ?? 0),
    };
    staleFallbackCache.set("birdeyeTradeVolume", { value, at: Date.now() });
    return value;
  } catch {
    if (cached && Date.now() - cached.at < BIRDEYE_STALE_MAX_AGE_MS) {
      return cached.value;
    }
    return null;
  }
}

interface StonkRoundBuy {
  spentRaw?: string;
}
interface StonkRoundEntry {
  at?: string;
  buys?: StonkRoundBuy[];
}
interface StonkRoundsResponse {
  rounds?: StonkRoundEntry[];
}

// A round settling on schedule buys all 5 basket slots; fewer than 4 buys
// means this entry is a carried-forward single-token flush, not a real
// round, and would badly skew the average if included.
const MIN_BUYS_FOR_REAL_ROUND = 4;

// The estimator needs the AVERAGE total fees a round actually distributes,
// not the current wallet's partial progress toward the next one — using
// the live snapshot (e.g. 1 SOL of 5) would understate a 30-day projection
// by multiples. stonk5.com's own round history records each round's basket
// spend (90% of that round's fee budget); scale back up to the full 100%
// and average over the last several real rounds.
async function fetchAverageRoundSol(): Promise<number | null> {
  return withStaleFallback("avgRoundSol", async () => {
    const json = (await fetchJson(`${STONK5_API_BASE}/rounds`)) as StonkRoundsResponse;
    const realRounds = (json.rounds ?? [])
      .filter((r) => (r.buys?.length ?? 0) >= MIN_BUYS_FOR_REAL_ROUND)
      .slice(0, ROUND_HISTORY_SAMPLE_SIZE);
    if (realRounds.length === 0) return null;

    const totals = realRounds.map((r) => {
      const basketSpentSol =
        (r.buys ?? []).reduce((sum, b) => sum + Number(b.spentRaw ?? 0), 0) / 1e9;
      return basketSpentSol / BASKET_SHARE_OF_ROUND;
    });
    return totals.reduce((a, b) => a + b, 0) / totals.length;
  });
}

export async function getTokenStats(): Promise<TokenStats> {
  const warnings: string[] = [];

  const [
    dexResult,
    stonkfunResult,
    onchainResult,
    basketResult,
    enginePayoutResult,
    engineLockResult,
    avgRoundSolResult,
    geckoTradersResult,
    tradeVolumeResult,
  ] = await Promise.allSettled([
    fetchDexscreener(),
    fetchStonkfunMeta(),
    getOnchainStats(),
    fetchBasket(),
    fetchEnginePayout(),
    fetchEngineLock(),
    fetchAverageRoundSol(),
    fetchGeckoTraders(),
    fetchBirdeyeTradeVolume(),
  ]);

  const dex = dexResult.status === "fulfilled" ? dexResult.value : null;
  const stonkfun = stonkfunResult.status === "fulfilled" ? stonkfunResult.value : null;
  const rpcOnchain: OnchainStats | null =
    onchainResult.status === "fulfilled" ? onchainResult.value : null;
  const basket = basketResult.status === "fulfilled" ? basketResult.value : null;
  const enginePayout =
    enginePayoutResult.status === "fulfilled" ? enginePayoutResult.value : null;
  const engineLock =
    engineLockResult.status === "fulfilled" ? engineLockResult.value : null;
  const avgRoundSol =
    avgRoundSolResult.status === "fulfilled" ? avgRoundSolResult.value : null;
  const geckoTraders =
    geckoTradersResult.status === "fulfilled" ? geckoTradersResult.value : null;
  const tradeVolume =
    tradeVolumeResult.status === "fulfilled" ? tradeVolumeResult.value : null;

  // stonk5.com's own engine API is the authoritative source for the
  // round-trigger reserve/progress/timer — it knows things (the buying
  // reserve vs. rent vs. hand-topped-up SOL, the exact round-start instant)
  // that can't be reconstructed from on-chain data alone. Prefer it, but
  // fall back to the on-chain-derived figures if it's unreachable rather
  // than losing the section entirely. Locked/in-vault token counts likewise
  // only exist in the engine's own bookkeeping.
  const onchain: OnchainStats | null = rpcOnchain
    ? {
        ...rpcOnchain,
        engineWalletSol: enginePayout?.walletSol ?? rpcOnchain.engineWalletSol,
        roundProgressPercent:
          enginePayout?.roundProgressPercent ?? rpcOnchain.roundProgressPercent,
        lastRoundTimestamp: enginePayout?.lastRoundTimestamp ?? rpcOnchain.lastRoundTimestamp,
        lockedTokens: engineLock?.lockedTokens ?? null,
        inVaultTokens: engineLock?.inVaultTokens ?? null,
        avgRoundSol,
      }
    : null;

  if (!dex && !stonkfun) {
    throw new Error(
      `Both market data sources failed. dexscreener: ${
        dexResult.status === "rejected" ? dexResult.reason?.message : ""
      } stonkfun: ${stonkfunResult.status === "rejected" ? stonkfunResult.reason?.message : ""}`
    );
  }

  if (!dex) {
    warnings.push(
      "Dexscreener unreachable — using stonkfun.xyz for price data; timeframe breakdown unavailable."
    );
  }
  if (!onchain) {
    warnings.push("Solana RPC unreachable — burn and engine-round data unavailable.");
  }

  const resolvedBasket = applyImageOverrides(basket ?? basketFromLocalSnapshot());
  if (!basket) {
    warnings.push(
      "Live payout-basket data unreachable — showing a recent saved snapshot of the top tokens."
    );
  }

  const marketCapDiscrepancy = pctDiff(
    dex?.marketCapUsd ?? null,
    stonkfun?.marketCapUsd ?? null
  );
  if (marketCapDiscrepancy !== null && marketCapDiscrepancy > 20) {
    warnings.push(
      "Market cap differs by more than 20% between sources — one may be stale."
    );
  }

  const primary = dex ?? stonkfun!;

  const basketAvgChange24h =
    basket && basket.length > 0
      ? basket.reduce((sum, t) => sum + (t.priceChange24h ?? 0), 0) / basket.length
      : null;
  const basketTotalMarketCapUsd =
    basket && basket.length > 0
      ? basket.reduce((sum, t) => sum + (t.marketCapUsd ?? 0), 0)
      : null;

  return {
    name: primary.name,
    symbol: primary.symbol,
    imageUrl: dex?.imageUrl ?? stonkfun?.imageUrl ?? null,

    priceUsd: primary.priceUsd,
    priceSol: dex?.priceSol ?? null,
    marketCapUsd: dex?.marketCapUsd ?? stonkfun?.marketCapUsd ?? null,
    fdvUsd: dex?.fdvUsd ?? stonkfun?.fdvUsd ?? null,
    liquidityUsd: dex?.liquidityUsd ?? stonkfun?.liquidityUsd ?? null,
    // When Birdeye's buy/sell split is available, derive the headline total
    // from it directly (buyUsd + sellUsd) so the two figures always agree —
    // DexScreener/stonkfun's own volume24hUsd is a different indexer's
    // number and can drift slightly from Birdeye's. Falls back to
    // DexScreener/stonkfun's total when Birdeye's split isn't available
    // (which is also when the split itself isn't shown, so there's nothing
    // to visibly disagree with).
    volume24hUsd: tradeVolume
      ? tradeVolume.buyUsd + tradeVolume.sellUsd
      : dex?.volume24hUsd ?? stonkfun?.volume24hUsd ?? null,
    priceChange: dex?.priceChange ?? null,
    volume: dex?.volume ?? null,
    traders24h: geckoTraders,
    recentTradeVolume: tradeVolume,

    peakMarketCapUsd: stonkfun?.peakMarketCapUsd ?? null,
    status: stonkfun?.status ?? null,
    graduationProgress: stonkfun?.graduationProgress ?? null,
    launch: stonkfun?.launch ?? null,

    onchain,
    basket: resolvedBasket,
    basketAvgChange24h,
    basketTotalMarketCapUsd,

    updatedAt: new Date().toISOString(),
    warnings,
  };
}
