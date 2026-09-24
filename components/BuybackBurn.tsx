"use client";

import { useState } from "react";
import { useStats } from "@/lib/statsContext";
import { formatCompactNumber } from "@/lib/format";
import { ISSUED_SUPPLY } from "@/lib/constants";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HORIZONS = [
  { tag: "1 Month", tick: "1M", days: 30 },
  { tag: "1 Year", tick: "1Y", days: 365 },
];

function formatPct(pct: number | null): string {
  if (pct === null || !Number.isFinite(pct)) return "—";
  return `${pct < 0.01 ? "<0.01" : pct.toFixed(2)}%`;
}

function StatValue({ children }: { children: React.ReactNode }) {
  return (
    <div className="num mt-1 flex items-center gap-1.5 text-2xl font-semibold text-ink">
      {children}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/stonk5-logo.png"
        alt=""
        width={18}
        height={18}
        className="h-[18px] w-[18px] rounded-full"
      />
    </div>
  );
}

export default function BuybackBurn() {
  const { stats } = useStats();
  const onchain = stats?.onchain ?? null;
  const launch = stats?.launch ?? null;
  const [now] = useState(() => Date.now());

  // A simple linear projection from the observed rate so far: total
  // burned/locked divided by days since launch. Naive by nature (round
  // sizes vary with trading volume, which won't stay constant), so it's
  // presented as "at the current average pace," not a forecast, and capped
  // at the 1B issued supply.
  const daysElapsed =
    launch?.createdAt != null
      ? Math.max((now - new Date(launch.createdAt).getTime()) / MS_PER_DAY, 0.25)
      : null;
  const burnedPerDay =
    onchain && daysElapsed !== null ? onchain.burnedTokens / daysElapsed : null;
  const lockedPerDay =
    onchain?.lockedTokens != null && daysElapsed !== null
      ? onchain.lockedTokens / daysElapsed
      : null;

  function project(current: number | null, perDay: number | null, days: number) {
    if (current === null || perDay === null) return null;
    return Math.min(ISSUED_SUPPLY, current + perDay * days);
  }

  return (
    <section className="wrap mt-16 sm:mt-22">
      <div className="glass p-8">
        <div className="label">Burn &amp; lock</div>
        <h3 className="mt-2">Every round burns 5% and locks 5%.</h3>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink2">
          Every $STONK5 buy or sell pays a transfer tax, which funds each
          round. 18% of that goes to each of the top 5 in the basket, and
          the rest comes back into $STONK5 — not out of what holders are
          paid. 5% of each round buys $STONK5 and burns it forever. Another
          5% buys $STONK5 and sends it to a vault that locks into a 5-year
          Jupiter Lock escrow every week — no cancel authority, a fixed
          recipient, and it can&apos;t be pulled forward.
        </p>

        <div className="mt-6 flex flex-wrap gap-8">
          <div>
            <div className="label">Total burned</div>
            <StatValue>{onchain ? formatCompactNumber(onchain.burnedTokens) : "—"}</StatValue>
            <div className="mt-0.5 text-[13px] text-mute">
              {onchain ? `${onchain.burnedPercent.toFixed(3)}% of issued supply` : "Verified on-chain"}
            </div>
          </div>
          <div>
            <div className="label">Locked</div>
            <StatValue>
              {onchain?.lockedTokens != null ? formatCompactNumber(onchain.lockedTokens) : "—"}
            </StatValue>
            <div className="mt-0.5 text-[13px] text-mute">In a 5-year Jupiter Lock escrow</div>
          </div>
          <div>
            <div className="label">In the vault</div>
            <StatValue>
              {onchain?.inVaultTokens != null ? formatCompactNumber(onchain.inVaultTokens) : "—"}
            </StatValue>
            <div className="mt-0.5 text-[13px] text-mute">Bought, waiting for the weekly lock</div>
          </div>
          <div>
            <div className="label">Total locked</div>
            <StatValue>
              {onchain?.lockedTokens != null && onchain?.inVaultTokens != null
                ? formatCompactNumber(onchain.lockedTokens + onchain.inVaultTokens)
                : "—"}
            </StatValue>
            <div className="mt-0.5 text-[13px] text-mute">Already locked + in the vault</div>
          </div>
          <div>
            <div className="label">Circulating supply</div>
            <StatValue>{onchain ? formatCompactNumber(onchain.totalSupply) : "—"}</StatValue>
            <div className="mt-0.5 text-[13px] text-mute">Down from 1B issued</div>
          </div>
        </div>

        {onchain &&
          (() => {
            // The vault is a rotating buffer (bought weekly, swept into the
            // escrow weekly), not something that grows monotonically the
            // way burned/locked-escrow do — so it's held at its current
            // snapshot value at every point on the bar (now, 1M, 1Y) rather
            // than projected forward, which would assume a growth pattern
            // we have no real basis for.
            const inVault = onchain.inVaultTokens ?? 0;
            const currentPct =
              onchain.burnedPercent + ((onchain.lockedTokens ?? 0) + inVault) / ISSUED_SUPPLY * 100;
            const markers = HORIZONS.map(({ tag, tick, days }) => {
              const projectedBurned = project(onchain.burnedTokens, burnedPerDay, days);
              const projectedLocked = project(onchain.lockedTokens, lockedPerDay, days);
              const combined =
                projectedBurned !== null || projectedLocked !== null
                  ? (projectedBurned ?? onchain.burnedTokens) +
                    (projectedLocked ?? onchain.lockedTokens ?? 0) +
                    inVault
                  : null;
              const combinedPct = combined !== null ? (combined / ISSUED_SUPPLY) * 100 : null;
              return { tag, tick, combinedPct };
            });
            const yearPct = markers[markers.length - 1]?.combinedPct ?? currentPct;
            // Scaled to a fixed 0-120% headroom, not just to whatever the
            // furthest projection happens to be — otherwise the 1-year
            // figure would always stretch to fill the entire bar
            // regardless of its actual value, which reads as "100% gone"
            // even when it's really ~92%.
            const barMaxPct = 120;
            const fillPct = Math.max(0.6, (yearPct / barMaxPct) * 100);

            return (
              <div className="mt-8">
                <div className="relative max-w-[460px] pt-4">
                  {markers.map(({ tag, tick, combinedPct }) => (
                    <span
                      key={tag}
                      className="absolute top-0 -translate-x-1/2 text-[10px] text-mute"
                      style={{ left: `${Math.min(100, ((combinedPct ?? 0) / barMaxPct) * 100)}%` }}
                    >
                      {tick}
                    </span>
                  ))}
                  <span
                    className="absolute top-0 -translate-x-1/2 text-[10px] text-mute"
                    style={{ left: `${(currentPct / barMaxPct) * 100}%` }}
                  >
                    Now
                  </span>
                  <div className="bar relative overflow-visible bg-[var(--fill-track)]">
                    <i
                      style={{
                        width: `${fillPct}%`,
                        background: "linear-gradient(90deg, #38bdf8 0%, #818cf8 45%, #c084fc 100%)",
                      }}
                    />
                    {markers.map(({ tag, combinedPct }) => (
                      <span
                        key={tag}
                        className="absolute -top-1 -bottom-1 w-[2px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)]"
                        style={{ left: `${Math.min(100, ((combinedPct ?? 0) / barMaxPct) * 100)}%` }}
                      />
                    ))}
                    <span
                      className="absolute -top-1 -bottom-1 w-[2px] -translate-x-1/2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.6)]"
                      style={{ left: `${(currentPct / barMaxPct) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-[11px] text-mute">
                    Now: {formatPct(currentPct)} of supply burned+locked
                  </span>
                  {markers.map(({ tag, combinedPct }) => (
                    <span key={tag} className="text-[11px] text-mute">
                      {tag}: {formatPct(combinedPct)} of supply burned+locked
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-mute">
                  Estimated at the current average pace — not a forecast.
                </p>
              </div>
            );
          })()}
      </div>
    </section>
  );
}
