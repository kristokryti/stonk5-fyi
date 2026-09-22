import { NextResponse } from "next/server";
import { DEX_CHAIN, GECKOTERMINAL_API_BASE, PAIR_ADDRESS } from "@/lib/constants";

const FETCH_TIMEOUT_MS = 8_000;

// GeckoTerminal's official public OHLCV API — used to render our own
// candlestick chart client-side instead of depending on DexScreener's
// embeddable iframe, which occasionally gets stuck on "Loading pair..."
// with no way for this page to detect or recover from it (cross-origin
// content, invisible to us). This is a documented, free, public endpoint,
// not scraping — see https://www.geckoterminal.com/dex-api for reference.
const TIMEFRAMES: Record<string, { unit: "minute" | "hour" | "day"; aggregate: number }> = {
  "1m": { unit: "minute", aggregate: 1 },
  "5m": { unit: "minute", aggregate: 5 },
  "15m": { unit: "minute", aggregate: 15 },
  "1h": { unit: "hour", aggregate: 1 },
  "4h": { unit: "hour", aggregate: 4 },
  "1d": { unit: "day", aggregate: 1 },
};

export interface OhlcvBar {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tf = searchParams.get("tf") ?? "1h";
  const config = TIMEFRAMES[tf] ?? TIMEFRAMES["1h"];

  try {
    const res = await fetch(
      `${GECKOTERMINAL_API_BASE}/networks/${DEX_CHAIN}/pools/${PAIR_ADDRESS}/ohlcv/${config.unit}?aggregate=${config.aggregate}&limit=200`,
      {
        cache: "no-store",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { accept: "application/json" },
      }
    );
    if (!res.ok) throw new Error(`geckoterminal responded ${res.status}`);
    const json = (await res.json()) as {
      data?: { attributes?: { ohlcv_list?: [number, number, number, number, number, number][] } };
    };
    const rows = json.data?.attributes?.ohlcv_list ?? [];
    const bars: OhlcvBar[] = rows
      .map(([time, open, high, low, close, volume]) => ({ time, open, high, low, close, volume }))
      .sort((a, b) => a.time - b.time);

    return NextResponse.json({ bars });
  } catch {
    return NextResponse.json({ bars: [], error: "OHLCV data unavailable" }, { status: 502 });
  }
}
