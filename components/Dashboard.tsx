"use client";

import { useEffect, useState } from "react";
import type { TokenStats } from "@/lib/types";
import { LINKS, REFRESH_INTERVAL_MS } from "@/lib/constants";
import { formatRelativeTime } from "@/lib/format";
import CopyAddress from "./CopyAddress";
import Chart from "./Chart";
import Explainer from "./Explainer";
import TimeframeStats from "./TimeframeStats";
import EngineStatus from "./EngineStatus";
import SafetyCard from "./SafetyCard";
import BasketList from "./BasketList";
import LaunchInfo from "./LaunchInfo";
import Logo from "./Logo";
import LiquidityHealth from "./LiquidityHealth";
import VolatilityCard from "./VolatilityCard";

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

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <Logo />
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

        <Explainer />

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
              className="rounded-lg border border-white/[0.08] px-3 py-2 text-navy-300 shadow-card transition-colors hover:border-navy-500 hover:text-navy-100"
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
