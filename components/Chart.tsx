"use client";

import { useEffect, useRef, useState } from "react";
import {
  CandlestickSeries,
  HistogramSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { LINKS } from "@/lib/constants";
import type { OhlcvBar } from "@/app/api/ohlcv/route";

// STONK5 trades at a fraction of a cent, so the chart's default 2-decimal
// price format would round it to 0.00. Pick enough decimals to show real
// precision based on the actual price magnitude.
function priceFormatFor(value: number) {
  if (!Number.isFinite(value) || value <= 0) return { precision: 2, minMove: 0.01 };
  if (value >= 1) return { precision: 2, minMove: 0.01 };
  const magnitude = Math.floor(Math.log10(value));
  const precision = Math.min(10, Math.max(2, -magnitude + 3));
  return { precision, minMove: Math.pow(10, -precision) };
}

function formatPrice(value: number, precision: number): string {
  return `$${value.toFixed(precision)}`;
}

const TIMEFRAMES = [
  { key: "1m", label: "1m" },
  { key: "5m", label: "5m" },
  { key: "15m", label: "15m" },
  { key: "1h", label: "1H" },
  { key: "4h", label: "4H" },
  { key: "1d", label: "1D" },
] as const;

interface Ohlc {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

export default function Chart() {
  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]["key"]>("1h");
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState<Ohlc | null>(null);
  const [lastBar, setLastBar] = useState<Ohlc | null>(null);
  const [firstClose, setFirstClose] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Our own candlestick + volume chart, rendered client-side from real
  // OHLCV data — no third-party iframe to get stuck on "Loading pair...".
  // Data comes from GeckoTerminal's public OHLCV API via /api/ohlcv.
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
    series.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.28 } });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "#38bdf850",
    });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    chart.subscribeCrosshairMove((param) => {
      const bar = param.seriesData.get(series) as CandlestickData<Time> | undefined;
      if (bar && "open" in bar) {
        setHovered({
          open: bar.open,
          high: bar.high,
          low: bar.low,
          close: bar.close,
          volume: 0,
          time: 0,
        });
      } else {
        setHovered(null);
      }
    });

    chartRef.current = chart;
    seriesRef.current = series;
    volumeRef.current = volume;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      volumeRef.current = null;
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
        const bars = json.bars;
        const last = bars[bars.length - 1];
        seriesRef.current?.applyOptions({
          priceFormat: { type: "price", ...priceFormatFor(last.close) },
        });
        seriesRef.current?.setData(
          bars.map((b) => ({
            time: b.time as Time,
            open: b.open,
            high: b.high,
            low: b.low,
            close: b.close,
          }))
        );
        volumeRef.current?.setData(
          bars.map((b) => ({
            time: b.time as Time,
            value: b.volume,
            color: b.close >= b.open ? "#5eead430" : "#fb718530",
          }))
        );
        chartRef.current?.timeScale().fitContent();
        setLastBar(last);
        setFirstClose(bars[0].open);
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

  const displayBar = hovered ?? lastBar;
  const precision = lastBar ? priceFormatFor(lastBar.close).precision : 6;
  const windowChangePct =
    lastBar && firstClose ? ((lastBar.close - firstClose) / firstClose) * 100 : null;

  return (
    <div className="glass overflow-hidden p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
        <div className="flex flex-wrap items-center gap-3">
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
          {windowChangePct !== null && (
            <span
              className={`num text-[12px] font-semibold ${
                windowChangePct >= 0 ? "text-[var(--pos)]" : "text-[var(--neg)]"
              }`}
            >
              {windowChangePct >= 0 ? "▲" : "▼"} {Math.abs(windowChangePct).toFixed(2)}%
            </span>
          )}
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

      {displayBar && (
        <div className="num flex flex-wrap gap-x-4 gap-y-0.5 px-4 pt-2 text-[11px] text-mute">
          <span>
            O <span className="text-ink2">{formatPrice(displayBar.open, precision)}</span>
          </span>
          <span>
            H <span className="text-ink2">{formatPrice(displayBar.high, precision)}</span>
          </span>
          <span>
            L <span className="text-ink2">{formatPrice(displayBar.low, precision)}</span>
          </span>
          <span>
            C <span className="text-ink2">{formatPrice(displayBar.close, precision)}</span>
          </span>
        </div>
      )}

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
