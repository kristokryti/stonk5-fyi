"use client";

import { useState } from "react";
import { useStats } from "@/lib/statsContext";
import { formatCompactNumber } from "@/lib/format";
import { ISSUED_SUPPLY } from "@/lib/constants";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const HORIZONS = [
  { label: "1 week", days: 7 },
  { label: "1 month", days: 30 },
  { label: "1 year", days: 365 },
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

        {onchain && (
          <div className="bar mt-6 max-w-[400px]">
            <i style={{ width: `${Math.max(0.5, onchain.burnedPercent)}%` }} />
          </div>
        )}

        {(burnedPerDay !== null || lockedPerDay !== null) && (
          <div className="mt-6 border-t border-[var(--line)] pt-5">
            <div className="label">At the current average pace</div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {HORIZONS.map(({ label, days }) => {
                const projectedBurned = project(onchain!.burnedTokens, burnedPerDay, days);
                const projectedLocked = project(
                  onchain!.lockedTokens,
                  lockedPerDay,
                  days
                );
                return (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-3"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-mute">
                      In {label}
                    </div>
                    <div className="mt-2">
                      <div className="text-[10px] uppercase tracking-wide text-mute">Burned</div>
                      <div className="num text-[13px] font-semibold text-ink">
                        {projectedBurned !== null
                          ? `≈ ${formatCompactNumber(projectedBurned)}`
                          : "—"}
                      </div>
                      <div className="text-[11px] text-mute">
                        {formatPct(
                          projectedBurned !== null
                            ? (projectedBurned / ISSUED_SUPPLY) * 100
                            : null
                        )}{" "}
                        of supply
                      </div>
                    </div>
                    <div className="mt-2.5">
                      <div className="text-[10px] uppercase tracking-wide text-mute">Locked</div>
                      <div className="num text-[13px] font-semibold text-ink">
                        {projectedLocked !== null
                          ? `≈ ${formatCompactNumber(projectedLocked)}`
                          : "—"}
                      </div>
                      <div className="text-[11px] text-mute">
                        {formatPct(
                          projectedLocked !== null
                            ? (projectedLocked / ISSUED_SUPPLY) * 100
                            : null
                        )}{" "}
                        of supply
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-mute">
              A simple projection from the average burn/lock rate observed so far — not a
              forecast. Round sizes move with trading volume, so the real pace will vary.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
