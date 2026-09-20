"use client";

import { useStats } from "@/lib/statsContext";
import Price from "./Price";
import { formatCompactUsd, formatPercent1dp } from "@/lib/format";

function StatCard({
  label,
  value,
  sub,
  subClassName = "text-mute",
}: {
  label: string;
  value: string;
  sub?: string;
  subClassName?: string;
}) {
  return (
    <div className="glass p-6">
      <div className="label">{label}</div>
      <div className="num mt-2 text-[34px] font-semibold text-ink">{value}</div>
      {sub && <div className={`mt-1 text-[13px] ${subClassName}`}>{sub}</div>}
    </div>
  );
}

export default function MarketBento() {
  const { stats } = useStats();

  const marketCap = stats?.marketCapUsd ?? null;
  const fdv = stats?.fdvUsd ?? null;
  const liquidity = stats?.liquidityUsd ?? null;
  const volume24h = stats?.volume24hUsd ?? null;
  const peak = stats?.peakMarketCapUsd ?? null;
  const change24h = stats?.priceChange?.h24 ?? null;
  const priceUsd = stats?.priceUsd ?? null;
  const priceSol = stats?.priceSol ?? null;

  const liquidityPct =
    liquidity !== null && marketCap ? (liquidity / marketCap) * 100 : null;
  const volumeMultiple =
    volume24h !== null && marketCap ? volume24h / marketCap : null;
  const drawdownPct =
    peak !== null && marketCap !== null && peak > 0
      ? ((marketCap - peak) / peak) * 100
      : null;

  const changePositive = change24h !== null && change24h >= 0;

  return (
    <section className="wrap mt-16 sm:mt-22">
      <div className="bento">
        <div className="glass price-card p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label">Stonk5 Index</span>
            <span className="chip">Solana</span>
            {stats?.status && <span className="chip chip-pos">{stats.status}</span>}
          </div>

          <div className="price mt-4 text-[72px] font-semibold leading-none text-ink">
            <Price value={priceUsd} />
          </div>

          <div className="mt-4 flex items-center gap-3">
            {change24h !== null ? (
              <span className={`chip ${changePositive ? "chip-pos" : "chip-neg"}`}>
                {changePositive ? "▲" : "▼"} {formatPercent1dp(change24h)}
              </span>
            ) : (
              <span className="chip">— 24h</span>
            )}
            <span className="code text-[13px] text-mute">
              {priceSol !== null ? `${priceSol} SOL` : "—"}
            </span>
          </div>
        </div>

        {marketCap !== null && (
          <StatCard
            label="Market cap"
            value={formatCompactUsd(marketCap)}
            sub={fdv !== null ? `FDV ${formatCompactUsd(fdv)}` : undefined}
          />
        )}

        {liquidity !== null && (
          <StatCard
            label="Liquidity"
            value={formatCompactUsd(liquidity)}
            sub={
              liquidityPct !== null
                ? `${liquidityPct.toFixed(1)}% of market cap`
                : undefined
            }
          />
        )}

        {volume24h !== null && (
          <StatCard
            label="24h volume"
            value={formatCompactUsd(volume24h)}
            sub={
              volumeMultiple !== null
                ? `${volumeMultiple.toFixed(2)}× market cap`
                : undefined
            }
          />
        )}

        {peak !== null && (
          <StatCard
            label="Peak market cap"
            value={formatCompactUsd(peak)}
            sub={
              drawdownPct !== null
                ? `${drawdownPct >= 0 ? "+" : "−"}${Math.abs(drawdownPct).toFixed(0)}% from peak`
                : undefined
            }
            subClassName="text-[var(--neg)]"
          />
        )}
      </div>
    </section>
  );
}
