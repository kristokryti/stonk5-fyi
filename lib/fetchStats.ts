import { DEXSCREENER_API_BASE, MINT, PAIR_ADDRESS, STONKFUN_API_BASE } from "./constants";
import { getOnchainStats } from "./solana";
import type { BasketToken, LaunchInfo, OnchainStats, TimeframeStats, TokenStats } from "./types";

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

interface DexData {
  priceUsd: number;
  priceSol: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceChange: TimeframeStats;
  volume: TimeframeStats;
  txns24h: { buys: number; sells: number } | null;
  imageUrl: string | null;
  name: string;
  symbol: string;
}

async function fetchDexscreener(): Promise<DexData> {
  const json = (await fetchJson(`${DEXSCREENER_API_BASE}/tokens/${MINT}`)) as {
    pairs?: any[];
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
    txns24h: pair.txns?.h24
      ? { buys: pair.txns.h24.buys ?? 0, sells: pair.txns.h24.sells ?? 0 }
      : null,
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

async function fetchStonkfunMeta(): Promise<StonkfunMeta> {
  const tokenRes = (await fetchJson(`${STONKFUN_API_BASE}/tokens/${MINT}`)) as any;
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
          createdAt: launchRecord.createdAt ?? token.createdAt,
          graduatedAt: token.graduatedAt ?? null,
          startMarketCapUsd: launchRecord.startMarketCapUsd ?? null,
        }
      : null,
  };
}

async function fetchBasket(): Promise<BasketToken[]> {
  const json = (await fetchJson(
    `${STONKFUN_API_BASE}/tokens?sort=marketCap&pageSize=5`
  )) as { data?: { tokens?: any[] } };
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
  }));
}

function pctDiff(a: number | null, b: number | null): number | null {
  if (a === null || b === null || a === 0) return null;
  return (Math.abs(a - b) / Math.abs(a)) * 100;
}

export async function getTokenStats(): Promise<TokenStats> {
  const warnings: string[] = [];

  const [dexResult, stonkfunResult, onchainResult, basketResult] = await Promise.allSettled([
    fetchDexscreener(),
    fetchStonkfunMeta(),
    getOnchainStats(),
    fetchBasket(),
  ]);

  const dex = dexResult.status === "fulfilled" ? dexResult.value : null;
  const stonkfun = stonkfunResult.status === "fulfilled" ? stonkfunResult.value : null;
  const onchain: OnchainStats | null =
    onchainResult.status === "fulfilled" ? onchainResult.value : null;
  const basket = basketResult.status === "fulfilled" ? basketResult.value : null;

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
  if (!stonkfun) {
    warnings.push(
      "stonkfun.xyz unreachable — graduation status and launch info unavailable."
    );
  }
  if (!onchain) {
    warnings.push("Solana RPC unreachable — burn and engine-round data unavailable.");
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
    volume24hUsd: dex?.volume24hUsd ?? stonkfun?.volume24hUsd ?? null,
    priceChange: dex?.priceChange ?? null,
    volume: dex?.volume ?? null,
    txns24h: dex?.txns24h ?? null,

    peakMarketCapUsd: stonkfun?.peakMarketCapUsd ?? null,
    status: stonkfun?.status ?? null,
    graduationProgress: stonkfun?.graduationProgress ?? null,
    launch: stonkfun?.launch ?? null,

    onchain,
    basket,
    basketAvgChange24h,
    basketTotalMarketCapUsd,

    updatedAt: new Date().toISOString(),
    warnings,
  };
}
