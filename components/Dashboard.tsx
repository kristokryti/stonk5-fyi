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
import Logo from "./Logo";
import PriceDisplay from "./PriceDisplay";
import LiquidityHealth from "./LiquidityHealth";
import VolatilityCard from "./VolatilityCard";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="px-1 text-xs font-semibold uppercase tracking-wider text-navy-500">
      {children}
    </h2>
  );
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "market", label: "Market" },
  { id: "engine", label: "Engine" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const [tab, setTab] = useState<TabId>("overview");

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
      <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl space-y-3 px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <nav className="flex gap-5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`border-b-2 pb-0.5 text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? "border-sky-400 text-navy-50"
                    : "border-transparent text-navy-500 hover:text-navy-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6 sm:py-14">
        {(error || stats?.warnings?.length) ? (
          <div className="space-y-2">
            {error && (
              <div className="rounded-2xl border border-white/[0.08] bg-navy-800 px-4 py-2.5 text-sm text-navy-300 shadow-card">
                {error}
              </div>
            )}
            {stats?.warnings?.map((warning) => (
              <div
                key={warning}
                className="rounded-2xl border border-white/[0.08] bg-navy-800 px-4 py-2.5 text-sm text-navy-300 shadow-card"
              >
                {warning}
              </div>
            ))}
          </div>
        ) : null}

        {tab === "overview" && (
          <>
            <Explainer />

            <section className="rounded-2xl border border-white/[0.08] bg-navy-800 p-6 shadow-card sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    {stats?.imageUrl ? (
                      <Image
                        src={stats.imageUrl}
                        alt={stats.symbol}
                        width={32}
                        height={32}
                        className="rounded-full border border-navy-700"
                      />
                    ) : (
                      <div className="h-8 w-8 shrink-0 rounded-full border border-navy-700 bg-navy-800" />
                    )}
                    <div className="flex items-center gap-2 text-sm text-navy-400">
                      <span>{stats?.name ?? "Stonk5 Index"}</span>
                      <span className="text-navy-600">·</span>
                      <span>Solana</span>
                      {stats?.status && (
                        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[11px] font-medium capitalize text-sky-400">
                          {stats.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-baseline gap-3">
                    <PriceDisplay
                      value={stats?.priceUsd ?? null}
                      className="font-sans text-3xl font-bold tracking-tight tabular-nums text-navy-50"
                    />
                    {priceChange24h !== null && (
                      <span
                        className={`font-sans text-sm font-semibold tabular-nums ${
                          priceChange24h >= 0 ? "text-sky-400" : "text-slate-400"
                        }`}
                      >
                        {formatPercent(priceChange24h)}{" "}
                        <span className="font-normal text-navy-500">24h</span>
                      </span>
                    )}
                  </div>
                  {stats?.priceSol != null && (
                    <div className="mt-1 font-mono text-xs text-navy-500">
                      {stats.priceSol.toFixed(10).replace(/0+$/, "")} SOL
                    </div>
                  )}
                </div>
                <BuyButton />
              </div>
            </section>

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

            <div className="space-y-3">
              <SectionLabel>Chart</SectionLabel>
              <Chart />
            </div>

            <CopyAddress />
          </>
        )}

        {tab === "market" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <LiquidityHealth
                liquidityUsd={stats?.liquidityUsd ?? null}
                marketCapUsd={stats?.marketCapUsd ?? null}
                volume24hUsd={stats?.volume24hUsd ?? null}
              />
              <TimeframeStats priceChange={stats?.priceChange ?? null} />
              <VolatilityCard priceChange={stats?.priceChange ?? null} />
              {stats?.txns24h && (
                <div className="rounded-2xl border border-white/[0.08] bg-navy-800 p-5 shadow-card">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
                    24h buys / sells
                  </div>
                  <div className="mt-3 flex items-center gap-4 font-sans text-sm tabular-nums">
                    <span className="text-sky-400">{stats.txns24h.buys} buys</span>
                    <span className="text-navy-600">/</span>
                    <span className="text-slate-400">{stats.txns24h.sells} sells</span>
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-navy-700/80">
                    <div
                      className="h-full bg-sky-400"
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

            <BasketList
              basket={stats?.basket ?? null}
              avgChange24h={stats?.basketAvgChange24h}
              totalMarketCapUsd={stats?.basketTotalMarketCapUsd}
            />
          </>
        )}

        {tab === "engine" && (
          <>
            <div className="space-y-3">
              <SectionLabel>Engine &amp; safety</SectionLabel>
              <div className="grid gap-3 sm:grid-cols-2">
                <EngineStatus onchain={stats?.onchain ?? null} />
                <SafetyCard onchain={stats?.onchain ?? null} />
              </div>
            </div>

            <LaunchInfo
              launch={stats?.launch ?? null}
              marketCapUsd={stats?.marketCapUsd ?? null}
              peakMarketCapUsd={stats?.peakMarketCapUsd ?? null}
            />

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
                  className="rounded-lg border border-white/[0.08] px-3 py-2 text-navy-300 shadow-card transition-colors hover:border-navy-500 hover:text-navy-100"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </>
        )}

        <footer className="space-y-1 pt-2 text-xs text-navy-500">
          <p>
            {stats
              ? `Updated ${formatRelativeTime(stats.updatedAt)} · price & volume from Dexscreener, status & launch data from stonkfun.xyz, burns & authorities verified on-chain`
              : "No live data"}
          </p>
          <p>
            <strong className="font-medium text-navy-400">
              Unofficial community tracker
            </strong>{" "}
            for STONK5. Not affiliated with StonkFun or the STONK5 team. Not
            financial advice.
          </p>
        </footer>
      </div>
    </>
  );
}
