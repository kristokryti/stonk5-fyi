"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AreaSeries,
  CandlestickSeries,
  HistogramSeries,
  PriceScaleMode,
  createChart,
  type IChartApi,
  type ISeriesApi,
  type Time,
} from "lightweight-charts";
import { LINKS } from "@/lib/constants";
import { formatCompactUsd } from "@/lib/format";
import { useStats } from "@/lib/statsContext";
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

function formatPrice(value: number, precision: number, mode: DisplayMode): string {
  return mode === "mcap" ? formatCompactUsd(value) : `$${value.toFixed(precision)}`;
}

const TIMEFRAMES = [
  { key: "1m", label: "1m" },
  { key: "5m", label: "5m" },
  { key: "15m", label: "15m" },
  { key: "1h", label: "1H" },
  { key: "4h", label: "4H" },
  { key: "1d", label: "1D" },
] as const;

type DisplayMode = "price" | "mcap";
type ChartType = "candles" | "line";

interface Ohlc {
  open: number;
  high: number;
  low: number;
  close: number;
}

function IconBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        active ? "bg-[var(--fill-track)] text-ink" : "text-mute hover:text-ink2"
      }`}
    >
      {children}
    </button>
  );
}

export default function Chart() {
  const { stats } = useStats();
  const totalSupply = stats?.onchain?.totalSupply ?? null;

  const [timeframe, setTimeframe] = useState<(typeof TIMEFRAMES)[number]["key"]>("1h");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("price");
  const [chartType, setChartType] = useState<ChartType>("candles");
  const [logScale, setLogScale] = useState(false);
  const [error, setError] = useState(false);
  const [hovered, setHovered] = useState<Ohlc | null>(null);
  const [rawBars, setRawBars] = useState<OhlcvBar[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const areaRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const scale = displayMode === "mcap" && totalSupply ? totalSupply : 1;

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

    const candle = chart.addSeries(CandlestickSeries, {
      upColor: "#5eead4",
      downColor: "#fb7185",
      borderVisible: false,
      wickUpColor: "#5eead4",
      wickDownColor: "#fb7185",
    });
    candle.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.28 } });

    const area = chart.addSeries(AreaSeries, {
      lineColor: "#38bdf8",
      topColor: "rgba(56,189,248,0.28)",
      bottomColor: "rgba(56,189,248,0.02)",
      lineWidth: 2,
      priceScaleId: "right",
      visible: false,
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
      color: "#38bdf850",
    });
    volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });

    chart.subscribeCrosshairMove((param) => {
      const bar: unknown = param.seriesData.get(candle) ?? param.seriesData.get(area);
      if (bar && typeof bar === "object" && "open" in bar) {
        const b = bar as { open: number; high: number; low: number; close: number };
        setHovered({ open: b.open, high: b.high, low: b.low, close: b.close });
      } else if (bar && typeof bar === "object" && "value" in bar) {
        const v = (bar as { value: number }).value;
        setHovered({ open: v, high: v, low: v, close: v });
      } else {
        setHovered(null);
      }
    });

    chartRef.current = chart;
    candleRef.current = candle;
    areaRef.current = area;
    volumeRef.current = volume;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      areaRef.current = null;
      volumeRef.current = null;
    };
  }, []);

  // Fetch on timeframe change (raw, un-scaled — display transform happens separately).
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
        setRawBars(json.bars);
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

  // Apply data + display mode + chart type to the chart whenever any change.
  useEffect(() => {
    if (rawBars.length === 0) return;
    const last = rawBars[rawBars.length - 1];
    const lastScaled = last.close * scale;
    const fmt =
      displayMode === "mcap"
        ? { type: "custom" as const, minMove: 0.01, formatter: (p: number) => formatCompactUsd(p) }
        : { type: "price" as const, ...priceFormatFor(lastScaled) };

    candleRef.current?.applyOptions({ priceFormat: fmt, visible: chartType === "candles" });
    areaRef.current?.applyOptions({ priceFormat: fmt, visible: chartType === "line" });

    const candleData = rawBars.map((b) => ({
      time: b.time as Time,
      open: b.open * scale,
      high: b.high * scale,
      low: b.low * scale,
      close: b.close * scale,
    }));
    candleRef.current?.setData(candleData);
    areaRef.current?.setData(candleData.map((b) => ({ time: b.time, value: b.close })));
    volumeRef.current?.setData(
      rawBars.map((b) => ({
        time: b.time as Time,
        value: b.volume,
        color: b.close >= b.open ? "#5eead430" : "#fb718530",
      }))
    );
    chartRef.current?.timeScale().fitContent();
  }, [rawBars, displayMode, chartType, scale]);

  useEffect(() => {
    chartRef.current
      ?.priceScale("right")
      .applyOptions({ mode: logScale ? PriceScaleMode.Logarithmic : PriceScaleMode.Normal });
  }, [logScale]);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(document.fullscreenElement === wrapRef.current);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      wrapRef.current?.requestFullscreen();
    }
  }

  const lastRaw = rawBars.length > 0 ? rawBars[rawBars.length - 1] : null;
  const firstRaw = rawBars.length > 0 ? rawBars[0] : null;
  const displayBar: Ohlc | null = useMemo(() => {
    if (hovered) return hovered;
    if (!lastRaw) return null;
    return {
      open: lastRaw.open * scale,
      high: lastRaw.high * scale,
      low: lastRaw.low * scale,
      close: lastRaw.close * scale,
    };
  }, [hovered, lastRaw, scale]);
  const precision = lastRaw ? priceFormatFor(lastRaw.close * scale).precision : 6;
  const windowChangePct =
    lastRaw && firstRaw ? ((lastRaw.close - firstRaw.open) / firstRaw.open) * 100 : null;

  return (
    <div ref={wrapRef} className="glass overflow-hidden p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="label">Chart</div>
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <IconBtn key={tf.key} active={timeframe === tf.key} onClick={() => setTimeframe(tf.key)} title={tf.label}>
                {tf.label}
              </IconBtn>
            ))}
          </div>
          <div className="flex gap-1 border-l border-[var(--line)] pl-3">
            <IconBtn active={chartType === "candles"} onClick={() => setChartType("candles")} title="Candlestick">
              Candles
            </IconBtn>
            <IconBtn active={chartType === "line"} onClick={() => setChartType("line")} title="Line / area">
              Line
            </IconBtn>
          </div>
          <div className="flex gap-1 border-l border-[var(--line)] pl-3">
            <IconBtn active={displayMode === "price"} onClick={() => setDisplayMode("price")} title="Price in USD">
              Price
            </IconBtn>
            <IconBtn
              active={displayMode === "mcap"}
              onClick={() => setDisplayMode("mcap")}
              title="Market cap"
            >
              Mkt Cap
            </IconBtn>
          </div>
          <div className="flex gap-1 border-l border-[var(--line)] pl-3">
            <IconBtn active={logScale} onClick={() => setLogScale((v) => !v)} title="Logarithmic scale">
              Log
            </IconBtn>
            <IconBtn active={isFullscreen} onClick={toggleFullscreen} title="Fullscreen">
              ⤢
            </IconBtn>
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
            O <span className="text-ink2">{formatPrice(displayBar.open, precision, displayMode)}</span>
          </span>
          <span>
            H <span className="text-ink2">{formatPrice(displayBar.high, precision, displayMode)}</span>
          </span>
          <span>
            L <span className="text-ink2">{formatPrice(displayBar.low, precision, displayMode)}</span>
          </span>
          <span>
            C <span className="text-ink2">{formatPrice(displayBar.close, precision, displayMode)}</span>
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
