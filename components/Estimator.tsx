"use client";

import { useState } from "react";
import { useStats } from "@/lib/statsContext";
import {
  BASKET_SHARE_OF_ROUND,
  LINKS,
  MIN_QUALIFY_TOKENS,
  MIN_QUALIFY_USD,
  ROUND_HISTORY_SAMPLE_SIZE,
  ROUND_MAX_HOURS,
} from "@/lib/constants";
import { proxiedTokenImage } from "@/lib/format";
import type { BasketToken } from "@/lib/types";

// Model assumptions, taken from stonk5.com's own published estimator
// methodology rather than invented here — applied to our live on-chain
// supply and engine-wallet figures instead of a static snapshot.
const ELIGIBLE_SUPPLY_SHARE = 0.98; // ~98% of supply is held by wallets above the qualifying minimum
const DELIVERY_COST_MAX = 0.05; // up to 5% withheld for delivery costs
const POOL_TAX_APPROX = 0.07; // roughly 7% lost to pool costs and transfer taxes
const ROUNDS_PER_30_DAYS = (30 * 24) / ROUND_MAX_HOURS; // if every round took exactly 5h to trigger

function parseHeld(input: string): number | null {
  const cleaned = input.replace(/,/g, "").trim();
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

// Reformats digits-as-typed into a comma-grouped string (e.g. "1000000" ->
// "1,000,000") so large holdings are easy to read at a glance while typing.
function formatHeldInput(raw: string): string {
  const cleaned = raw.replace(/,/g, "");
  if (cleaned === "" || cleaned === ".") return cleaned;
  if (!/^\d*\.?\d*$/.test(cleaned)) return cleaned;
  const [whole, ...rest] = cleaned.split(".");
  const groupedWhole = whole === "" ? "" : Number(whole).toLocaleString("en-US");
  return rest.length > 0 ? `${groupedWhole}.${rest.join("")}` : groupedWhole;
}

function formatApproxAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  const maximumFractionDigits = value < 1 ? 4 : value < 1000 ? 2 : 0;
  return value.toLocaleString("en-US", { maximumFractionDigits });
}

function TokenIcon({ symbol, imageUrl }: { symbol: string; imageUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const src = proxiedTokenImage(imageUrl, symbol);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={28}
        height={28}
        loading="lazy"
        className="h-7 w-7 shrink-0 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--fill-track)] text-[10px] font-semibold text-ink2">
      {symbol.slice(0, 2).toUpperCase()}
    </span>
  );
}

export default function Estimator() {
  const { stats } = useStats();
  const [heldInput, setHeldInput] = useState(formatHeldInput("1000000"));

  const totalSupply = stats?.onchain?.totalSupply ?? null;
  const avgRoundSol = stats?.onchain?.avgRoundSol ?? null;
  const basket = stats?.basket ?? null;
  const priceUsd = stats?.priceUsd ?? null;
  const priceSol = stats?.priceSol ?? null;
  const solUsdRate = priceUsd !== null && priceSol ? priceUsd / priceSol : null;

  const held = parseHeld(heldInput);
  const eligible = held !== null && held >= MIN_QUALIFY_TOKENS;

  let sharePct: number | null = null;
  let receiveSolTotal: number | null = null;

  if (eligible && totalSupply && avgRoundSol !== null) {
    const eligibleSupply = totalSupply * ELIGIBLE_SUPPLY_SHARE;
    sharePct = (held / eligibleSupply) * 100;
    const basketBudget = avgRoundSol * BASKET_SHARE_OF_ROUND;
    const netFactor = 1 - DELIVERY_COST_MAX - POOL_TAX_APPROX;
    receiveSolTotal = basketBudget * netFactor * (held / eligibleSupply);
  }

  // Each basket slot gets an equal 18% share of the round, so the
  // SOL-equivalent value per token is the total split evenly — converted
  // into an actual token count using that token's own live USD price.
  interface TokenEstimate {
    token: BasketToken;
    amount: number | null;
    monthlyAmount: number | null;
  }
  const perTokenBreakdown: TokenEstimate[] =
    basket && receiveSolTotal !== null && solUsdRate !== null
      ? basket.map((token) => {
          const perTokenSol = receiveSolTotal! / basket.length;
          const perTokenUsd = perTokenSol * solUsdRate;
          const amount = token.priceUsd ? perTokenUsd / token.priceUsd : null;
          const monthlyAmount = amount !== null ? amount * ROUNDS_PER_30_DAYS : null;
          return { token, amount, monthlyAmount };
        })
      : [];

  return (
    <section className="wrap mt-16 sm:mt-22">
      <h2>What would you receive?</h2>
      <p className="lead mt-2">
        Enter what you hold — the average round size is fetched automatically.
      </p>

      <div className="glass glass-lg mt-6 p-8">
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <div>
              <label className="mb-2 block text-sm text-ink2" htmlFor="held-input">
                $STONK5 you hold
              </label>
              <div className="relative">
                <input
                  id="held-input"
                  value={heldInput}
                  onChange={(e) => setHeldInput(formatHeldInput(e.target.value))}
                  inputMode="decimal"
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] py-3 pl-4 pr-[108px] font-sans text-[15px] font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--c2)]"
                />
                <a
                  href={LINKS.stonkfun}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="View $STONK5 on StonkFun"
                  className="absolute inset-y-0 right-2 flex items-center gap-1.5 rounded-xl bg-[var(--fill-track)] px-2.5 transition-colors hover:bg-[var(--line-strong)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/stonk5-logo.png"
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] rounded-full"
                  />
                  <span className="text-[13px] font-medium text-ink2">STONK5</span>
                </a>
              </div>
              {held !== null && priceUsd !== null && (
                <div className="mt-1.5 text-[12px] text-ink2">
                  ≈ $
                  {(held * priceUsd).toLocaleString("en-US", { maximumFractionDigits: 2 })} at
                  the current price
                </div>
              )}
              <div className="mt-1 text-[12px] text-mute">
                Minimum to qualify: {MIN_QUALIFY_TOKENS.toLocaleString()} $STONK5 (or $
                {MIN_QUALIFY_USD} worth)
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-ink2">
                <span className="dot-live" aria-hidden="true" style={{ width: 6, height: 6 }} />
                Average fees per round
              </div>
              <div className="num mt-1.5 text-[15px] font-semibold text-ink">
                {avgRoundSol !== null ? `${avgRoundSol.toFixed(2)} SOL` : "—"}
              </div>
              <div className="mt-1.5 text-[12px] text-mute">
                Averaged over the last {ROUND_HISTORY_SAMPLE_SIZE} real rounds
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-5 py-4">
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
          </div>

          <div>
            <div className="label">You&apos;d receive (modelled)</div>
            <div className="mt-1 text-[12px] text-mute">
              Per round — <strong className="text-ink2">at least once every 5 hours</strong>,
              sooner if fees fill up faster — plus what that adds up to over 30 days if
              every round took the full 5 hours.
            </div>

            <div className="mt-3 flex flex-col gap-2">
              {held === null || !eligible ? (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-6 text-center text-[13px] text-mute">
                  {held !== null && !eligible
                    ? `Below the qualifying minimum — hold at least ${MIN_QUALIFY_TOKENS.toLocaleString()} $STONK5 (or $${MIN_QUALIFY_USD} worth) to earn anything.`
                    : "Enter how much $STONK5 you hold to see this."}
                </div>
              ) : perTokenBreakdown.length > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3 px-4 text-[10px] font-semibold uppercase tracking-wide text-mute">
                    <span />
                    <div className="flex items-center gap-6 text-right">
                      <span className="w-[92px]">Per round</span>
                      <span className="w-[92px]">Per 30 days</span>
                    </div>
                  </div>
                  {perTokenBreakdown.map(({ token, amount, monthlyAmount }) => (
                    <div
                      key={token.mint}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <TokenIcon symbol={token.symbol} imageUrl={token.imageUrl} />
                        <span className="text-[13px] font-medium text-ink">{token.symbol}</span>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div className="w-[92px] num text-[13px] font-semibold text-pos">
                          {amount !== null ? `≈ ${formatApproxAmount(amount)}` : "—"}
                        </div>
                        <div className="w-[92px] num text-[13px] font-semibold text-ink">
                          {monthlyAmount !== null ? `≈ ${formatApproxAmount(monthlyAmount)}` : "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-6 text-center text-[13px] text-mute">
                  —
                </div>
              )}
            </div>
          </div>
        </div>

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
