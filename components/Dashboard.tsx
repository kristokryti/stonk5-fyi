"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { TokenStats } from "@/lib/types";
import { LINKS, REFRESH_INTERVAL_MS } from "@/lib/constants";
import { formatPercent, formatRelativeTime, formatUsd } from "@/lib/format";
import StatCard from "./StatCard";
import CopyAddress from "./CopyAddress";
import Chart from "./Chart";
import BuyButton from "./BuyButton";
import Explainer from "./Explainer";
import TimeframeStats from "./TimeframeStats";
import EngineStatus from "./EngineStatus";
import LaunchInfo from "./LaunchInfo";

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

  const priceChange24h = stats?.priceChange?.h24 ?? null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {stats?.imageUrl ? (
            <Image
              src={stats.imageUrl}
              alt={stats.symbol}
              width={56}
              height={56}
              className="rounded-full border border-navy-700"
            />
          ) : (
            <div className="h-14 w-14 rounded-full border border-navy-700 bg-navy-800" />
          )}
          <div>
            <h1 className="text-2xl font-semibold text-navy-50">
              {stats?.symbol ?? "STONK5"}
            </h1>
            <p className="text-sm text-navy-400">
              {stats?.name ?? "Stonk5 Index"} · Solana
            </p>
          </div>
        </div>
        <BuyButton />
      </header>

      {error && (
        <div className="rounded-lg border border-accent/40 bg-accent-light/10 px-4 py-2 text-sm text-accent-tint">
          {error}
        </div>
      )}
      {stats?.warnings?.map((warning) => (
        <div
          key={warning}
          className="rounded-lg border border-accent/40 bg-accent-light/10 px-4 py-2 text-sm text-accent-tint"
        >
          {warning}
        </div>
      ))}

      <div className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
        <div className="text-xs uppercase tracking-wide text-navy-400">
          Price
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-3">
          <span className="font-mono text-4xl font-semibold text-navy-50">
            {stats ? formatUsd(stats.priceUsd) : "—"}
          </span>
          {priceChange24h !== null && (
            <span
              className={`font-mono text-lg ${
                priceChange24h >= 0 ? "text-teal-soft" : "text-accent-hover"
              }`}
            >
              {formatPercent(priceChange24h)} (24h)
            </span>
          )}
        </div>
      </div>

      <Explainer />

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

      <div className="grid gap-3 sm:grid-cols-2">
        <TimeframeStats priceChange={stats?.priceChange ?? null} />
        {stats?.txns24h && (
          <div className="rounded-xl border border-navy-700 bg-navy-800/60 p-4">
            <div className="text-xs uppercase tracking-wide text-navy-400">
              24h buys / sells
            </div>
            <div className="mt-3 flex items-center gap-4 font-mono text-sm">
              <span className="text-teal-soft">{stats.txns24h.buys} buys</span>
              <span className="text-navy-400">/</span>
              <span className="text-accent-hover">{stats.txns24h.sells} sells</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-navy-700">
              <div
                className="h-full bg-teal-soft"
                style={{
                  width: `${
                    (stats.txns24h.buys /
                      Math.max(1, stats.txns24h.buys + stats.txns24h.sells)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <EngineStatus onchain={stats?.onchain ?? null} />

      <LaunchInfo
        launch={stats?.launch ?? null}
        marketCapUsd={stats?.marketCapUsd ?? null}
        peakMarketCapUsd={stats?.peakMarketCapUsd ?? null}
      />

      <Chart />

      <CopyAddress />

      <div className="flex flex-wrap gap-3 text-sm">
        <a
          href={LINKS.website}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-navy-700 px-3 py-2 text-navy-200 transition hover:border-navy-500"
        >
          Website
        </a>
        <a
          href={LINKS.twitter}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-navy-700 px-3 py-2 text-navy-200 transition hover:border-navy-500"
        >
          X / Twitter
        </a>
        <a
          href={LINKS.stonkfun}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-navy-700 px-3 py-2 text-navy-200 transition hover:border-navy-500"
        >
          stonkfun.xyz
        </a>
        <a
          href={LINKS.dexscreener}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-navy-700 px-3 py-2 text-navy-200 transition hover:border-navy-500"
        >
          Dexscreener
        </a>
        <a
          href={LINKS.solscanToken}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-navy-700 px-3 py-2 text-navy-200 transition hover:border-navy-500"
        >
          Solscan
        </a>
      </div>

      <footer className="space-y-1 pt-4 text-xs text-navy-500">
        <p>
          {stats
            ? `Updated ${formatRelativeTime(stats.updatedAt)} · price & volume from Dexscreener, status & launch data from stonkfun.xyz, burns verified on-chain`
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
