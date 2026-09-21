"use client";

import { useEffect, useRef, useState } from "react";
import { CandlestickSeries, createChart, type IChartApi, type ISeriesApi } from "lightweight-charts";
import { LINKS } from "@/lib/constants";
import type { OhlcvBar } from "@/app/api/ohlcv/route";

const TIMEFRAMES = [
  { key: "15m", label: "15m" },
  { key: "1h", label: "1H" },
  { key: "4h", label: "4H" },
  { key: "1d", label: "1D" },
] as const;

export default function Chart() {
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]["key"]>("1h");
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Our own candlestick chart, rendered client-side from real OHLCV data —
  // no third-party iframe to get stuck on "Loading pair...". Data comes
  // from GeckoTerminal's public OHLCV API via our own /api/ohlcv proxy.
  useEffect(() => {
    if (!containerRef.current) return;
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#7c87a8",
        fontFamily: "var(--font-sans)",
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.05)" },
        horzLines: { color: "rgba(255,255,255,0.05)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.1)" },
      timeScale: { borderColor: "rgba(255,255,255,0.1)", timeVisible: true },
      crosshair: { mode: 0 },
      autoSize: true,
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#5eead4",
      downColor: "#fb7185",
      borderVisible: false,
      wickUpColor: "#5eead4",
      wickDownColor: "#fb7185",
    });
    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError(false);
      try {
        const res = await fetch(`/api/ohlcv?tf=${timeframe}`, { cache: "no-store" });
        const json = (await res.json()) as { bars: OhlcvBar[] };
        if (cancelled) return;
        if (!res.ok || json.bars.length === 0) {
          setError(true);
          return;
        }
        seriesRef.current?.setData(
          json.bars.map((b) => ({
            time: b.time as never,
            open: b.open,
            high: b.high,
            low: b.low,
            close: b.close,
          }))
        );
        chartRef.current?.timeScale().fitContent();
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [timeframe]);

  return (
    <div className="glass overflow-hidden p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
        <div className="flex items-center gap-3">
          <div className="label">Chart</div>
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.key}
                onClick={() => setTimeframe(tf.key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  timeframe === tf.key
                    ? "bg-[var(--fill-track)] text-ink"
                    : "text-mute hover:text-ink2"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
        <a
          href={LINKS.dexscreener}
          target="_blank"
          rel="noreferrer"
          className="text-[13px] text-mute hover:text-ink2"
        >
          Open on DexScreener ↗
        </a>
      </div>
      <div className="relative mt-2 h-[420px] w-full sm:h-[500px]">
        <div ref={containerRef} className="h-full w-full" />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center rounded-[16px] bg-[var(--bg)] text-[13px] text-mute">
            Chart data unavailable right now —{" "}
            <a href={LINKS.dexscreener} target="_blank" rel="noreferrer" className="ml-1 underline">
              view on DexScreener ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
