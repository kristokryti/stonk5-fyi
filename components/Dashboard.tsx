"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { TokenStats } from "@/lib/types";
import { LINKS, REFRESH_INTERVAL_MS } from "@/lib/constants";
import { formatNumber, formatPercent, formatRelativeTime, formatUsd } from "@/lib/format";
import StatCard from "./StatCard";
import CopyAddress from "./CopyAddress";
import Chart from "./Chart";

export default function Dashboard({
  initialStats,
}: {
  initialStats: TokenStats | null;
}) {
  const [stats, setStats] = useState<TokenStats | null>(initialStats);
  const [error, setError] = useState<string | null>(
    initialStats ? null : "Unable to load live data right now."
  );
  const [, forceTick] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        if (!res.ok) throw new Error("stats endpoint error");
        const data = (await res.json()) as TokenStats;
        if (!cancelled) {
          setStats(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Live refresh failed — showing last known data.");
      }
    }

    const interval = setInterval(poll, REFRESH_INTERVAL_MS);
    const tickInterval = setInterval(() => forceTick((n) => n + 1), 5_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      clearInterval(tickInterval);
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        {stats?.imageUrl ? (
          <Image
            src={stats.imageUrl}
            alt={stats.symbol}
            width={56}
            height={56}
            className="rounded-full border border-zinc-800"
          />
        ) : (
          <div className="h-14 w-14 rounded-full border border-zinc-800 bg-zinc-900" />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-zinc-50">
            {stats?.symbol ?? "STONK5"}
          </h1>
          <p className="text-sm text-zinc-500">
            {stats?.name ?? "Stonk5 Index"} · Solana
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-2 text-sm text-amber-400">
          {error}
        </div>
      )}
      {stats?.warning && (
        <div className="rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-2 text-sm text-amber-400">
          {stats.warning}
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          Price
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-4xl font-semibold text-zinc-50">
            {stats ? formatUsd(stats.priceUsd) : "—"}
          </span>
          {stats?.priceChange24h !== null && stats?.priceChange24h !== undefined && (
            <span
              className={`font-mono text-lg ${
                stats.priceChange24h >= 0 ? "text-accent-up" : "text-accent-down"
              }`}
            >
              {formatPercent(stats.priceChange24h)} (24h)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Market cap" value={stats ? formatUsd(stats.marketCapUsd, { compact: true }) : "—"} />
        <StatCard label="FDV" value={stats ? formatUsd(stats.fdvUsd, { compact: true }) : "—"} />
        <StatCard label="Liquidity" value={stats ? formatUsd(stats.liquidityUsd, { compact: true }) : "—"} />
        <StatCard label="24h volume" value={stats ? formatUsd(stats.volume24hUsd, { compact: true }) : "—"} />
        <StatCard
          label="Peak market cap"
          value={stats?.peakMarketCapUsd != null ? formatUsd(stats.peakMarketCapUsd, { compact: true }) : "—"}
        />
        <StatCard
          label="Status"
          value={stats?.status ?? "—"}
          sub={
            stats?.graduationProgress != null
              ? `Graduation ${(stats.graduationProgress * 100).toFixed(0)}%`
              : undefined
          }
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <div className="text-xs uppercase tracking-wide text-zinc-500">
          Burns
        </div>
        {stats?.burns ? (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <div className="font-mono text-lg text-zinc-100">
                {formatNumber(stats.burns.amountTokens)}
              </div>
              <div className="text-xs text-zinc-500">STONK5 burned</div>
            </div>
            <div>
              <div className="font-mono text-lg text-zinc-100">
                {formatUsd(stats.burns.valueUsdAtBurn)}
              </div>
              <div className="text-xs text-zinc-500">Value at burn</div>
            </div>
            <div>
              <div className="font-mono text-lg text-zinc-100">
                {formatNumber(stats.burns.burnCount)}
              </div>
              <div className="text-xs text-zinc-500">Burn events</div>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">
            Burn data unavailable from the current source.
          </p>
        )}
      </div>

      <Chart />

      <CopyAddress />

      <div className="flex flex-wrap gap-3 text-sm">
        <a
          href={LINKS.website}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 transition hover:border-zinc-600"
        >
          Website
        </a>
        <a
          href={LINKS.twitter}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 transition hover:border-zinc-600"
        >
          X / Twitter
        </a>
        <a
          href={LINKS.stonkfun}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 transition hover:border-zinc-600"
        >
          stonkfun.xyz
        </a>
        <a
          href={LINKS.dexscreener}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-zinc-800 px-3 py-2 text-zinc-300 transition hover:border-zinc-600"
        >
          Dexscreener
        </a>
      </div>

      <footer className="space-y-1 pt-4 text-xs text-zinc-600">
        <p>
          {stats
            ? `Data source: ${stats.source} · updated ${formatRelativeTime(stats.updatedAt)}`
            : "No live data"}
        </p>
        <p>
          Unofficial community tracker for STONK5. Not affiliated with
          StonkFun. Not financial advice.
        </p>
      </footer>
    </div>
  );
}
