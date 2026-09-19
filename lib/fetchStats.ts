import {
  DEXSCREENER_API_BASE,
  MINT,
  PAIR_ADDRESS,
  STONKFUN_API_BASE,
} from "./constants";
import type { TokenStats } from "./types";

const FETCH_TIMEOUT_MS = 8_000;

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status}`);
  }
  return res.json();
}

async function fetchStonkfun(): Promise<TokenStats> {
  const [tokenRes, burnsRes] = await Promise.all([
    fetchJson(`${STONKFUN_API_BASE}/tokens/${MINT}`),
    fetchJson(`${STONKFUN_API_BASE}/tokens/${MINT}/burns`).catch(() => null),
  ]);

  const token = (tokenRes as any)?.data?.token;
  if (!token) throw new Error("stonkfun: unexpected response shape");

  const burnTotals = (burnsRes as any)?.data?.totals ?? null;

  return {
    source: "stonkfun",
    name: token.name ?? "Stonk5 Index",
    symbol: token.symbol ?? "STONK5",
    imageUrl: token.imageUrl ?? null,
    priceUsd: Number(token.market?.priceUsd ?? 0),
    marketCapUsd: token.market?.marketCapUsd ?? null,
    fdvUsd: token.market?.fdvUsd ?? null,
    liquidityUsd: token.market?.liquidityUsd ?? null,
    volume24hUsd: token.market?.volume24hUsd ?? null,
    priceChange24h: token.market?.priceChange24h ?? null,
    peakMarketCapUsd: token.market?.peakMarketCapUsd ?? null,
    status: token.status ?? null,
    graduationProgress: token.graduationProgress ?? null,
    burns: burnTotals
      ? {
          amountTokens: Number(burnTotals.amountTokens ?? 0),
          valueUsdAtBurn: Number(burnTotals.valueUsdAtBurn ?? 0),
          burnCount: Number(burnTotals.burnCount ?? 0),
        }
      : null,
    updatedAt: new Date().toISOString(),
  };
}

async function fetchDexscreener(): Promise<TokenStats> {
  const json = (await fetchJson(`${DEXSCREENER_API_BASE}/tokens/${MINT}`)) as {
    pairs?: any[];
  };
  const pairs = json.pairs ?? [];
  const pair =
    pairs.find((p) => p.pairAddress === PAIR_ADDRESS) ??
    pairs.sort(
      (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0)
    )[0];

  if (!pair) throw new Error("dexscreener: no pairs found");

  return {
    source: "dexscreener",
    name: pair.baseToken?.name ?? "Stonk5 Index",
    symbol: pair.baseToken?.symbol ?? "STONK5",
    imageUrl: pair.info?.imageUrl ?? null,
    priceUsd: Number(pair.priceUsd ?? 0),
    marketCapUsd: pair.marketCap ?? null,
    fdvUsd: pair.fdv ?? null,
    liquidityUsd: pair.liquidity?.usd ?? null,
    volume24hUsd: pair.volume?.h24 ?? null,
    priceChange24h: pair.priceChange?.h24 ?? null,
    peakMarketCapUsd: null,
    status: null,
    graduationProgress: null,
    burns: null,
    updatedAt: new Date().toISOString(),
    warning:
      "Live from Dexscreener fallback — burn data unavailable while stonkfun.xyz is unreachable.",
  };
}

export async function getTokenStats(): Promise<TokenStats> {
  try {
    return await fetchStonkfun();
  } catch (stonkfunError) {
    try {
      return await fetchDexscreener();
    } catch (dexscreenerError) {
      throw new Error(
        `Both data sources failed. stonkfun: ${(stonkfunError as Error).message}; dexscreener: ${(dexscreenerError as Error).message}`
      );
    }
  }
}
