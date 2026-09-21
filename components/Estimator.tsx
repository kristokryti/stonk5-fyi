"use client";

import { useState } from "react";
import { useStats } from "@/lib/statsContext";
import { MIN_QUALIFY_TOKENS, MIN_QUALIFY_USD, ROUND_SOL_THRESHOLD } from "@/lib/constants";

// Model assumptions, taken from stonk5.com's own published estimator
// methodology rather than invented here — applied to our live on-chain
// supply and engine-wallet figures instead of a static snapshot.
const ELIGIBLE_SUPPLY_SHARE = 0.98; // ~98% of supply is held by wallets above the qualifying minimum
const BASKET_SHARE_OF_ROUND = 0.9; // 18% x 5 slots
const DELIVERY_COST_MAX = 0.05; // up to 5% withheld for delivery costs
const POOL_TAX_APPROX = 0.07; // roughly 7% lost to pool costs and transfer taxes

function parseHeld(input: string): number | null {
  const cleaned = input.replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export default function Estimator() {
  const { stats } = useStats();
  const [heldInput, setHeldInput] = useState("250000");

  const totalSupply = stats?.onchain?.totalSupply ?? null;
  const feesTowardRound = stats?.onchain?.engineWalletSol ?? null;

  const held = parseHeld(heldInput);
  const eligible = held !== null && held >= MIN_QUALIFY_TOKENS;

  let sharePct: number | null = null;
  let receiveSol: number | null = null;

  if (eligible && totalSupply && feesTowardRound !== null) {
    const eligibleSupply = totalSupply * ELIGIBLE_SUPPLY_SHARE;
    sharePct = (held / eligibleSupply) * 100;
    const basketBudget = feesTowardRound * BASKET_SHARE_OF_ROUND;
    const netFactor = 1 - DELIVERY_COST_MAX - POOL_TAX_APPROX;
    receiveSol = basketBudget * netFactor * (held / eligibleSupply);
  }

  return (
    <section className="wrap mt-16 sm:mt-22">
      <h2>What would you receive?</h2>
      <p className="lead mt-2">
        Enter what you hold — this round&apos;s fees are fetched automatically.
      </p>

      <div className="glass glass-lg mt-6 p-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div>
              <label className="mb-2 block text-sm text-ink2" htmlFor="held-input">
                $STONK5 you hold
              </label>
              <input
                id="held-input"
                value={heldInput}
                onChange={(e) => setHeldInput(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-3 font-sans text-[15px] font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--c2)]"
              />
              <div className="mt-1.5 text-[12px] text-mute">
                Minimum to qualify: {MIN_QUALIFY_TOKENS.toLocaleString()} $STONK5 (or $
                {MIN_QUALIFY_USD} worth)
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-ink2">
                <span className="dot-live" aria-hidden="true" style={{ width: 6, height: 6 }} />
                Fees toward this round
              </div>
              <div className="num mt-1.5 text-[15px] font-semibold text-ink">
                {feesTowardRound !== null
                  ? `${feesTowardRound.toFixed(2)} / ${ROUND_SOL_THRESHOLD} SOL`
                  : "—"}
              </div>
              <div className="mt-1.5 text-[12px] text-mute">
                Fetched live — same source as the round trigger above
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-5 py-4">
              <div className="label">Your estimated share</div>
              <div className="num mt-1 text-2xl font-semibold text-ink">
                {held === null
                  ? "—"
                  : !eligible
                    ? "0%"
                    : sharePct !== null
                      ? `${sharePct < 0.001 ? "<0.001" : sharePct.toFixed(3)}%`
                      : "—"}
              </div>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-5 py-4">
              <div className="label">You&apos;d receive (modelled)</div>
              <div className="num mt-1 text-2xl font-semibold text-pos">
                {!eligible
                  ? "—"
                  : receiveSol !== null
                    ? `≈ ${receiveSol.toFixed(6)} SOL`
                    : "—"}
              </div>
              <div className="mt-1.5 text-[12px] text-mute">split across the 5 basket tokens</div>
            </div>
          </div>
        </div>

        {held !== null && !eligible && (
          <p className="mt-5 text-[13px] text-mute">
            Below the qualifying minimum — holding at least{" "}
            {MIN_QUALIFY_TOKENS.toLocaleString()} $STONK5 (or ${MIN_QUALIFY_USD} worth) is
            needed to earn anything.
          </p>
        )}

        <div className="mt-6 rounded-xl border border-[var(--line)] bg-[rgba(255,255,255,0.03)] px-4 py-3.5 text-[12px] leading-relaxed text-mute">
          An estimate against a model, not a forecast — based on the current circulating
          supply, the 5% burn / 5% lock split, and stonk5.com&apos;s own published
          assumptions (~98% of supply held above the minimum, up to 5% withheld for
          delivery costs, ~7% lost to pool costs and transfer taxes). Your actual share
          depends on what everyone else holds at the time, which nobody can know in
          advance.
        </div>
      </div>
    </section>
  );
}
