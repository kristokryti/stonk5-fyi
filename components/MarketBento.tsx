"use client";

import Image from "next/image";
import { useStats } from "@/lib/statsContext";
import Price from "./Price";
import { formatCompactUsd, formatPercent1dp } from "@/lib/format";
import { LINKS } from "@/lib/constants";

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

function SplitStat({
  label,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  label: string;
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
}) {
  const total = leftValue + rightValue;
  const leftPct = total > 0 ? (leftValue / total) * 100 : 50;

  return (
    <div>
      <div className="label">{label}</div>
      <div className="mt-2 flex items-baseline justify-between gap-3">
        <span className="num text-2xl font-semibold text-[var(--pos)]">
          {leftValue.toLocaleString()}
        </span>
        <span className="num text-2xl font-semibold text-[var(--neg)]">
          {rightValue.toLocaleString()}
        </span>
      </div>
      <div className="bar mt-2 flex">
        <i style={{ width: `${leftPct}%`, background: "var(--pos)", borderRadius: "99px 0 0 99px" }} />
        <i
          style={{
            width: `${100 - leftPct}%`,
            background: "var(--neg)",
            borderRadius: "0 99px 99px 0",
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-mute">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
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
  const traders = stats?.traders24h ?? null;

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
            <a
              href={LINKS.stonkfun}
              target="_blank"
              rel="noreferrer"
              className="label flex items-center gap-1.5 hover:text-ink2"
            >
              <Image
                src="/stonk5-logo.png"
                alt=""
                width={16}
                height={16}
                className="rounded-full"
              />
              Stonk5 Index
            </a>
            <span className="chip">Solana</span>
            <span className="chip chip-info">Paired with SOL</span>
          </div>

          <div className="price mt-4 break-all text-[clamp(2.5rem,9vw,4.5rem)] font-semibold leading-none text-ink">
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-[38ch] text-[13px] leading-relaxed text-mute">
              Price and 24h change from DexScreener.
            </p>
            <a
              href={LINKS.stonkfun}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-[13px] font-medium text-ink2 hover:text-ink"
            >
              Trade $STONK5 ↗
            </a>
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
          />
        )}
      </div>

      {traders && (
        <div className="glass mt-6 p-8">
          <div className="label">Trading activity (24h)</div>
          <h3 className="mt-2">Who&apos;s buying and selling</h3>
          <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink2">
            Unique wallets and transactions on the STONK5/SOL pool, from
            GeckoTerminal.
          </p>

          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <SplitStat
              label="Traders"
              leftLabel="Buyers"
              leftValue={traders.buyers}
              rightLabel="Sellers"
              rightValue={traders.sellers}
            />
            <SplitStat
              label="Transactions"
              leftLabel="Buys"
              leftValue={traders.buys}
              rightLabel="Sells"
              rightValue={traders.sells}
            />
          </div>
        </div>
      )}
    </section>
  );
}
