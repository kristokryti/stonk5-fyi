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
import SafetyCard from "./SafetyCard";
import BasketList from "./BasketList";
import LaunchInfo from "./LaunchInfo";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-navy-500">
      {children}
    </h2>
  );
}

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
    <>
      <div className="sticky top-0 z-10 border-b border-navy-800 bg-navy-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            {stats?.imageUrl ? (
              <Image
                src={stats.imageUrl}
                alt={stats.symbol}
                width={28}
                height={28}
                className="rounded-full border border-navy-700"
              />
            ) : (
              <div className="h-7 w-7 shrink-0 rounded-full border border-navy-700 bg-navy-800" />
            )}
            <span className="truncate text-sm font-semibold text-navy-50">
              {stats?.symbol ?? "STONK5"}
            </span>
            <span className="hidden font-mono text-sm tabular-nums text-navy-200 sm:inline">
              {stats ? formatUsd(stats.priceUsd) : "—"}
            </span>
            {priceChange24h !== null && (
              <span
                className={`hidden font-mono text-xs tabular-nums sm:inline ${
                  priceChange24h >= 0 ? "text-teal-soft" : "text-accent-hover"
                }`}
              >
                {formatPercent(priceChange24h)}
              </span>
            )}
          </div>
          <BuyButton />
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        {(error || stats?.warnings?.length) ? (
          <div className="space-y-2">
            {error && (
              <div className="rounded-xl border border-navy-700 bg-navy-800/60 px-4 py-2.5 text-sm text-navy-300">
                {error}
              </div>
            )}
            {stats?.warnings?.map((warning) => (
              <div
                key={warning}
                className="rounded-xl border border-navy-700 bg-navy-800/60 px-4 py-2.5 text-sm text-navy-300"
              >
                {warning}
              </div>
            ))}
          </div>
        ) : null}

        <section className="rounded-2xl border border-navy-700/60 bg-navy-800/50 p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-2 text-sm text-navy-400">
            <span>{stats?.name ?? "Stonk5 Index"}</span>
            <span className="text-navy-600">·</span>
            <span>Solana</span>
            {stats?.status && (
              <span className="rounded-full bg-teal-deep/30 px-2 py-0.5 text-[11px] font-medium capitalize text-teal-soft">
                {stats.status}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-4xl font-semibold tabular-nums text-navy-50 sm:text-5xl">
              {stats ? formatUsd(stats.priceUsd) : "—"}
            </span>
            {priceChange24h !== null && (
              <span
                className={`font-mono text-lg tabular-nums ${
                  priceChange24h >= 0 ? "text-teal-soft" : "text-accent-hover"
                }`}
              >
                {formatPercent(priceChange24h)}{" "}
                <span className="text-sm text-navy-500">24h</span>
              </span>
            )}
          </div>
        </section>

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
            label="Graduation"
            value={stats?.graduationProgress != null ? `${(stats.graduationProgress * 100).toFixed(0)}%` : "—"}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <TimeframeStats priceChange={stats?.priceChange ?? null} />
          {stats?.txns24h && (
            <div className="rounded-2xl border border-navy-700/60 bg-navy-800/50 p-5 shadow-card">
              <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
                24h buys / sells
              </div>
              <div className="mt-3 flex items-center gap-4 font-mono text-sm tabular-nums">
                <span className="text-teal-soft">{stats.txns24h.buys} buys</span>
                <span className="text-navy-600">/</span>
                <span className="text-accent-hover">{stats.txns24h.sells} sells</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-navy-700/80">
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

        <div className="space-y-3">
          <SectionLabel>Engine &amp; safety</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            <EngineStatus onchain={stats?.onchain ?? null} />
            <SafetyCard onchain={stats?.onchain ?? null} />
          </div>
        </div>

        <BasketList basket={stats?.basket ?? null} />

        <LaunchInfo
          launch={stats?.launch ?? null}
          marketCapUsd={stats?.marketCapUsd ?? null}
          peakMarketCapUsd={stats?.peakMarketCapUsd ?? null}
        />

        <div className="space-y-3">
          <SectionLabel>Chart</SectionLabel>
          <Chart />
        </div>

        <CopyAddress />

        <div className="flex flex-wrap gap-2 text-sm">
          {[
            { href: LINKS.website, label: "Website" },
            { href: LINKS.twitter, label: "X / Twitter" },
            { href: LINKS.stonkfun, label: "stonkfun.xyz" },
            { href: LINKS.dexscreener, label: "Dexscreener" },
            { href: LINKS.solscanToken, label: "Solscan" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-navy-700/60 px-3 py-2 text-navy-300 transition-colors hover:border-navy-500 hover:text-navy-100"
            >
              {link.label}
            </a>
          ))}
        </div>

        <footer className="space-y-1 pt-2 text-xs text-navy-500">
          <p>
            {stats
              ? `Updated ${formatRelativeTime(stats.updatedAt)} · price & volume from Dexscreener, status & launch data from stonkfun.xyz, burns & authorities verified on-chain`
              : "No live data"}
          </p>
          <p>
            Unofficial community tracker for STONK5. Not affiliated with
            StonkFun. Not financial advice.
          </p>
        </footer>
      </div>
    </>
  );
}
