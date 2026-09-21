"use client";

import { useState } from "react";
import { useStats } from "@/lib/statsContext";
import { formatCompactNumber } from "@/lib/format";
import { ISSUED_SUPPLY } from "@/lib/constants";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HORIZONS = [
  { tag: "1 Month from now", days: 30, color: "#38bdf8" },
  { tag: "1 Year from now", days: 365, color: "#c084fc" },
];

function formatPct(pct: number | null): string {
  if (pct === null || !Number.isFinite(pct)) return "—";
  return `${pct < 0.01 ? "<0.01" : pct.toFixed(2)}%`;
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
            <div className="num mt-1 text-2xl font-semibold text-ink">
              {onchain ? formatCompactNumber(onchain.burnedTokens) : "—"}
            </div>
            <div className="mt-0.5 text-[13px] text-mute">
              {onchain ? `${onchain.burnedPercent.toFixed(3)}% of issued supply` : "Verified on-chain"}
            </div>
          </div>
          <div>
            <div className="label">Locked</div>
            <div className="num mt-1 text-2xl font-semibold text-ink">
              {onchain?.lockedTokens != null ? formatCompactNumber(onchain.lockedTokens) : "—"}
            </div>
            <div className="mt-0.5 text-[13px] text-mute">In a 5-year Jupiter Lock escrow</div>
          </div>
          <div>
            <div className="label">In the vault</div>
            <div className="num mt-1 text-2xl font-semibold text-ink">
              {onchain?.inVaultTokens != null ? formatCompactNumber(onchain.inVaultTokens) : "—"}
            </div>
            <div className="mt-0.5 text-[13px] text-mute">Bought, waiting for the weekly lock</div>
          </div>
          <div>
            <div className="label">Circulating supply</div>
            <div className="num mt-1 text-2xl font-semibold text-ink">
              {onchain ? formatCompactNumber(onchain.totalSupply) : "—"}
            </div>
            <div className="mt-0.5 text-[13px] text-mute">Down from 1B issued</div>
          </div>
        </div>

        {onchain &&
          (() => {
            const currentPct = onchain.burnedPercent + (onchain.lockedTokens ?? 0) / ISSUED_SUPPLY * 100;
            const markers = HORIZONS.map(({ tag, days, color }) => {
              const projectedBurned = project(onchain.burnedTokens, burnedPerDay, days);
              const projectedLocked = project(onchain.lockedTokens, lockedPerDay, days);
              const combined =
                projectedBurned !== null || projectedLocked !== null
                  ? (projectedBurned ?? onchain.burnedTokens) +
                    (projectedLocked ?? onchain.lockedTokens ?? 0)
                  : null;
              const combinedPct = combined !== null ? (combined / ISSUED_SUPPLY) * 100 : null;
              return { tag, color, combinedPct };
            });
            const barMaxPct = Math.max(
              currentPct,
              ...markers.map((m) => m.combinedPct ?? 0),
              1
            );

            // Stacked, edge-to-edge segments: "now" fills up to the current
            // burned+locked amount, then each horizon adds only the extra
            // it projects on top of the one before it — so the full bar
            // visually represents the furthest projection (1Y), divided up
            // by how much of it is already done vs. still to come.
            let cursorPct = currentPct;
            const segments = [
              { key: "now", widthPct: (currentPct / barMaxPct) * 100, color: undefined },
              ...markers.map(({ tag, color, combinedPct }) => {
                const start = cursorPct;
                const end = Math.max(combinedPct ?? start, start);
                cursorPct = end;
                return { key: tag, widthPct: ((end - start) / barMaxPct) * 100, color };
              }),
            ];

            return (
              <div className="mt-6">
                <div className="bar flex w-full">
                  <i
                    className="shrink-0"
                    style={{ width: `${Math.max(0.5, segments[0].widthPct)}%` }}
                  />
                  {segments.slice(1).map((seg) => (
                    <span
                      key={seg.key}
                      className="block h-full shrink-0"
                      style={{ width: `${Math.max(0, seg.widthPct)}%`, backgroundColor: seg.color }}
                    />
                  ))}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1.5 text-[11px] text-mute">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: "linear-gradient(90deg, #38bdf8, #818cf8)" }}
                    />
                    Current: {formatPct(currentPct)} of supply burned + locked
                  </span>
                  {markers.map(({ tag, color, combinedPct }) => (
                    <span key={tag} className="flex items-center gap-1.5 text-[11px] text-mute">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {tag}: {formatPct(combinedPct)} of supply burned + locked
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
