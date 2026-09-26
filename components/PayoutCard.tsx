"use client";

import { useEffect, useState } from "react";
import { useStats } from "@/lib/statsContext";
import {
  ENGINE_WALLET,
  LINKS,
  ROUND_MAX_HOURS,
  ROUND_MIN_BUDGET_SOL_FALLBACK,
  ROUND_SOL_THRESHOLD,
} from "@/lib/constants";
import { formatCountdown, proxiedTokenImage, shortenAddress } from "@/lib/format";
import type { BasketToken } from "@/lib/types";

// Token images are routed through /api/token-image, which always returns a
// valid image (the real logo, proxied server-side, or a generated initials
// fallback) — see that route for why. The client-side onError fallback
// below is defense in depth in case our own route ever errors.
function BasketSlot({ token }: { token: BasketToken }) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = proxiedTokenImage(token.imageUrl, token.symbol);
  const showImage = src && !imgFailed;

  return (
    <a
      href={LINKS.stonkfunToken(token.mint)}
      target="_blank"
      rel="noreferrer"
      className="slot overflow-hidden transition-transform hover:scale-105"
      title={token.symbol}
      aria-label={`View ${token.symbol} on StonkFun`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        token.symbol.slice(0, 2).toUpperCase()
      )}
    </a>
  );
}

const RING_SIZE = 232;
const STROKE = 14;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function PayoutCard() {
  const { stats } = useStats();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const onchain = stats?.onchain ?? null;
  const walletSol = onchain?.engineWalletSol ?? null;
  // The buying reserve, not the raw wallet balance — that's what the 5 SOL
  // trigger is actually measured against (walletSol also carries rent + any
  // hand-topped-up SOL, per stonk5.com's own breakdown). Falls back to the
  // wallet balance only when the engine API is unreachable and we're on the
  // on-chain-only path, where that split isn't available.
  const reserveSol = onchain?.reserveSol ?? walletSol;
  const minBudgetSol = onchain?.minBudgetSol ?? ROUND_MIN_BUDGET_SOL_FALLBACK;
  const feePct = onchain?.roundProgressPercent ?? 0;
  const lastRoundTs = onchain?.lastRoundTimestamp ?? null;

  const timerDueMs = ROUND_MAX_HOURS * 60 * 60 * 1000;
  let timerPct: number | null = null;
  let timerRemainingMs: number | null = null;
  let timerElapsedValue: string | null = null;

  if (lastRoundTs) {
    const roundStart = new Date(lastRoundTs).getTime();
    const elapsed = Math.max(0, now - roundStart);
    timerPct = Math.min(100, (elapsed / timerDueMs) * 100);
    timerRemainingMs = Math.max(0, timerDueMs - elapsed);
    // Capped at the 5h mark — once the timer's due it can sit past 5h for a
    // while waiting on the budget below, and "5h 51m of 5h" reads as broken.
    const cappedElapsed = Math.min(elapsed, timerDueMs);
    const elapsedHours = Math.floor(cappedElapsed / (60 * 60 * 1000));
    const elapsedMinutes = Math.floor((cappedElapsed % (60 * 60 * 1000)) / (60 * 1000));
    timerElapsedValue = `${elapsedHours}h ${elapsedMinutes}m`;
  }

  // "Whichever comes first": the round is due once either side hits its
  // threshold. Per stonk5.com's own engine, a time-triggered round still
  // waits for the reserve to cover a minimum operating budget before firing
  // — without surfacing that, the countdown just hits 00:00:00 and sits
  // there looking stuck instead of explaining why.
  const isTimeDue = timerPct !== null && timerPct >= 100;
  const isFeeDue = feePct >= 100;
  const isDue = isTimeDue || isFeeDue;
  const isWaitingForBudget = isDue && !isFeeDue && reserveSol !== null && reserveSol < minBudgetSol;

  const ringPct = Math.max(timerPct ?? 0, feePct);
  const dashOffset = CIRCUMFERENCE * (1 - ringPct / 100);

  const ringLabel = isDue ? "Round trigger" : "Next payout in";
  const ringValue = isWaitingForBudget
    ? `waiting for ${minBudgetSol} SOL`
    : isDue
      ? "Ready"
      : timerRemainingMs !== null
        ? formatCountdown(timerRemainingMs)
        : "—";

  const ariaLabel = isWaitingForBudget
    ? `Round is due — the engine is waiting for at least ${minBudgetSol} SOL in reserve to cover round costs before it fires`
    : isDue
      ? "Round trigger condition met — the round should fire any moment"
      : timerRemainingMs !== null
        ? `Next payout in approximately ${formatCountdown(timerRemainingMs)}`
        : "Next payout time unavailable — showing engine wallet progress only";

  const basket = stats?.basket ?? null;

  return (
    <section className="wrap mt-16 sm:mt-22">
      <div className="glass glass-lg pay-grid">
        <div
          className="relative mx-auto flex items-center justify-center"
          style={{ width: RING_SIZE, height: RING_SIZE }}
          role="timer"
          aria-live="off"
          aria-label={ariaLabel}
        >
          <svg width={RING_SIZE} height={RING_SIZE} aria-hidden="true">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#C084FC" />
              </linearGradient>
            </defs>
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--fill-track)"
              strokeWidth={STROKE}
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-5">
            <span className="label">{ringLabel}</span>
            <span
              className={`num mt-1 font-semibold tabular-nums text-ink ${
                isWaitingForBudget ? "text-[18px] leading-snug" : "text-[36px]"
              }`}
            >
              {ringValue}
            </span>
          </div>
        </div>

        <div>
          <div className="label">Round trigger · whichever comes first</div>
          {isDue && (
            <p className="mt-2 text-[12px] leading-relaxed text-mute">
              {isWaitingForBudget
                ? `Trigger condition met — the engine holds off firing until the reserve covers a ${minBudgetSol} SOL operating budget for round costs.`
                : "Trigger condition met — the round should fire any moment now."}
            </p>
          )}

          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink2">Timer</span>
              <span className="num text-sm font-semibold text-ink">
                {timerElapsedValue !== null ? (
                  <>
                    {timerElapsedValue}
                    <span className="font-medium text-mute"> of {ROUND_MAX_HOURS}h</span>
                    {isTimeDue && (
                      <span className="ml-1.5 rounded-full bg-[var(--fill-track)] px-1.5 py-0.5 text-[10px] font-semibold text-ink2">
                        Ready
                      </span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="bar mt-2">
              <i style={{ width: `${timerPct ?? 0}%` }} />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-ink2">Fees toward next round</span>
              <span className="num text-sm font-semibold text-ink">
                {reserveSol !== null ? (
                  <>
                    {reserveSol.toFixed(3)}
                    <span className="font-medium text-mute"> / {ROUND_SOL_THRESHOLD} SOL</span>
                    {isFeeDue && (
                      <span className="ml-1.5 rounded-full bg-[var(--fill-track)] px-1.5 py-0.5 text-[10px] font-semibold text-ink2">
                        Ready
                      </span>
                    )}
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="bar mt-2">
              <i style={{ width: `${Math.min(100, feePct)}%` }} />
            </div>
            <a
              href={LINKS.solscanEngineWallet}
              target="_blank"
              rel="noreferrer"
              className="code mt-2 inline-block text-[13px] text-mute hover:text-ink2"
            >
              Engine wallet: {shortenAddress(ENGINE_WALLET)} ↗
            </a>
          </div>
        </div>

        <div>
          <div className="label">Current payout basket</div>
          <div className="mt-3 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const token = basket?.[i];
              if (!token) {
                return (
                  <div key={i} className="slot">
                    {i + 1}
                  </div>
                );
              }
              return <BasketSlot key={token.mint} token={token} />;
            })}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink2">
            The five biggest StonkFun tokens at the moment of each round —
            you will receive these for holding at least 50,000 $STONK5
            (or $20 worth).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip chip-pos">5% burns $STONK5 permanently</span>
            <span className="chip chip-pos">5% locks $STONK5 to a 5-year Jupiter Lock</span>
          </div>
        </div>
      </div>
    </section>
  );
}
