"use client";

import { useState } from "react";
import { LINKS } from "@/lib/constants";
import { formatDate, formatUsd, proxiedTokenImage } from "@/lib/format";
import type { ClaimsOpenEntry, ClaimsPayoutEntry, ClaimsResponse } from "@/lib/types";

function formatTokenAmount(raw: string, decimals: number): string {
  const value = Number(raw) / 10 ** decimals;
  if (!Number.isFinite(value)) return "—";
  const maximumFractionDigits = value < 1 ? 6 : value < 1000 ? 2 : 0;
  return value.toLocaleString("en-US", { maximumFractionDigits });
}

function openStatusLabel(status: string): string {
  if (status === "ready") return "Ready — sent next round";
  if (status === "below-minimum-payout") return "Below delivery floor";
  if (status === "cost-exceeds-value") return "Delivery cost too high";
  return "Carried to next round";
}

// The claims API's own `detail` field is an internal/debug string (raw
// token amounts, no formatting — e.g. "net 28241168207 below floor
// 61880087087"), not meant for display. Build the actual explanation from
// the same structured fields the official site's version of this text
// draws from: what it's worth, why it's not going out yet, and the real
// dollar floor it needs to clear.
function openExplainer(entry: ClaimsOpenEntry): string | null {
  if (entry.status === "ready") {
    return "Already clears the floor to deliver — goes out with the next round, no separate action needed.";
  }
  if (entry.floorUsd == null) return null;
  const worth = formatUsd(entry.valueUsd);
  const floor = formatUsd(entry.floorUsd);
  if (entry.needsAccount) {
    return `Worth ${worth}. Sending it means opening you a token account, which only makes sense once it's worth at least ${floor} — it grows with every round until then.`;
  }
  return `Worth ${worth}. The cost of sending it is still more than it's worth right now — it grows with every round until it clears ${floor}.`;
}

function groupPayoutsByRound(payouts: ClaimsPayoutEntry[]): [string, ClaimsPayoutEntry[]][] {
  const map = new Map<string, ClaimsPayoutEntry[]>();
  for (const p of payouts) {
    const arr = map.get(p.ts) ?? [];
    arr.push(p);
    map.set(p.ts, arr);
  }
  return Array.from(map.entries()).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
}

function TokenIcon({ symbol, imageUrl }: { symbol: string; imageUrl?: string | null }) {
  const [failed, setFailed] = useState(false);
  const src = proxiedTokenImage(imageUrl, symbol);
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={22}
        height={22}
        loading="lazy"
        className="h-[22px] w-[22px] shrink-0 rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--fill-track)] text-[9px] font-semibold text-ink2">
      {symbol.slice(0, 2).toUpperCase()}
    </span>
  );
}

const WALLET_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export default function YourRounds() {
  const [input, setInput] = useState("");
  const [data, setData] = useState<ClaimsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!WALLET_RE.test(trimmed)) {
      setError("Enter a valid Solana wallet address.");
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/claims?wallet=${encodeURIComponent(trimmed)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Lookup failed.");
      setData(json as ClaimsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  const holder = data?.holder ?? null;
  const rounds = holder ? groupPayoutsByRound(holder.payouts) : [];
  const openEntries = holder ? Object.entries(holder.open) : [];

  // Per-token running totals (already summed by the claims API across every
  // round, not just the last few shown below), plus their combined value —
  // tokens can't be added together directly, but their USD values can,
  // using the same live prices the claims API already reports per token.
  const receivedEntries = holder
    ? Object.entries(holder.received).sort(([mintA], [mintB]) => {
        const valueOf = (mint: string) => {
          const entry = holder.received[mint];
          const meta = data?.tokens[mint];
          if (!meta) return 0;
          return (Number(entry.netRaw) / 10 ** meta.decimals) * meta.priceUsd;
        };
        return valueOf(mintB) - valueOf(mintA);
      })
    : [];
  const totalReceivedUsd = receivedEntries.reduce((sum, [mint, entry]) => {
    const meta = data?.tokens[mint];
    if (!meta) return sum;
    const amount = Number(entry.netRaw) / 10 ** meta.decimals;
    if (!Number.isFinite(amount)) return sum;
    return sum + amount * meta.priceUsd;
  }, 0);

  return (
    <section id="your-rewards" className="wrap mt-16 sm:mt-22">
      <h2>My rewards</h2>
      <p className="lead mt-2">
        Paste a public wallet address holding $STONK5 to see what rewards
        it has received, and what&apos;s still carried, straight from the
        engine&apos;s own books.
      </p>

      <div className="glass glass-lg mt-6 p-8">
        <form onSubmit={lookup} className="flex flex-wrap gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Solana wallet address, e.g. 7xKXtg2CW87d97TXJSDpb...D4Y1YqCM"
            className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-3 font-mono text-[13px] text-ink placeholder:text-mute focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--c2)]"
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? "Looking up…" : "See rewards"}
          </button>
        </form>

        <p className="mt-3 text-[13px] text-mute">
          For full reward history, check your wallet address in the Claims
          section of the official{" "}
          <a
            href={LINKS.website}
            target="_blank"
            rel="noreferrer"
            className="text-ink2 underline underline-offset-2 hover:text-ink"
          >
            stonk5.com
          </a>{" "}
          website.
        </p>

        {error && <p className="mt-3 text-[13px] text-[var(--neg)]">{error}</p>}

        {data && !holder && (
          <p className="mt-6 text-sm leading-relaxed text-ink2">
            This wallet hasn&apos;t received a payout yet — holding at least{" "}
            {data.rule.minBalanceTokens.toLocaleString()} $STONK5 (or $
            {data.rule.minBalanceUsd} worth) at a round&apos;s settlement
            qualifies it for the next one.
          </p>
        )}

        {data && holder && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="label">Current balance</div>
                <div className="num mt-1 text-xl font-semibold text-ink">
                  {formatTokenAmount(holder.balanceRaw, data.rule.rewardTokenDecimals)} $STONK5
                </div>
              </div>
              <span className={`chip ${holder.eligible ? "chip-pos" : "chip-neg"}`}>
                {holder.eligible ? "Eligible" : "Not currently eligible"}
              </span>
            </div>

            {receivedEntries.length > 0 && (
              <div className="mt-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div className="label">Total received</div>
                  <div className="num text-sm font-semibold text-ink">
                    ≈ {formatUsd(totalReceivedUsd)}{" "}
                    <span className="font-normal text-mute">across every round</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {receivedEntries.map(([mint, entry]) => {
                    const meta = data.tokens[mint];
                    return (
                      <span
                        key={mint}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--fill-soft)] py-1 pl-1 pr-3 text-[13px] font-medium text-ink"
                      >
                        <TokenIcon symbol={meta?.symbol ?? "?"} imageUrl={meta?.imageUrl} />
                        {meta?.symbol ?? mint.slice(0, 4)}{" "}
                        <span className="font-normal text-mute">
                          {formatTokenAmount(entry.netRaw, meta?.decimals ?? 6)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {openEntries.length > 0 && (
              <div className="mt-6">
                <div className="label">Carried — not yet delivered</div>
                <p className="mt-1 text-[12px] leading-relaxed text-mute">
                  A payout that&apos;s too small to deliver yet — either it
                  doesn&apos;t clear the cost of opening you a token account,
                  or (once you have one) it doesn&apos;t clear the cost of
                  sending it — rides along and grows with every round until
                  it does, or gets paid out earlier if a bigger round pushes
                  it over the line.
                </p>
                <div className="mt-3 space-y-3">
                  {openEntries.map(([mint, entry]) => {
                    const meta = data.tokens[mint];
                    const explainer = openExplainer(entry);
                    const pct =
                      entry.floorUsd != null && entry.floorUsd > 0
                        ? Math.min(100, (entry.valueUsd / entry.floorUsd) * 100)
                        : null;
                    return (
                      <div
                        key={mint}
                        className="rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] p-4"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <TokenIcon symbol={meta?.symbol ?? "?"} imageUrl={meta?.imageUrl} />
                          <span className="text-sm font-semibold text-ink">
                            {meta?.symbol ?? mint.slice(0, 4)}
                          </span>
                          <span className="chip text-[11px]">{openStatusLabel(entry.status)}</span>
                        </div>
                        {explainer && (
                          <p className="mt-2 text-[12px] leading-relaxed text-mute">{explainer}</p>
                        )}
                        {pct !== null && (
                          <div className="bar mt-3">
                            <i style={{ width: `${pct}%` }} />
                          </div>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 text-[11px] text-mute">
                          <span>
                            {formatTokenAmount(entry.netRaw, meta?.decimals ?? 6)}{" "}
                            {meta?.symbol ?? ""} · about {formatUsd(entry.valueUsd)}
                          </span>
                          {pct !== null && entry.floorUsd != null && (
                            <span>
                              {pct.toFixed(0)}% of the way to {formatUsd(entry.floorUsd)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-[var(--line)]">
              {rounds.length === 0 && (
                <p className="pt-4 text-sm text-ink2">No payouts recorded yet.</p>
              )}
              {rounds.slice(0, 6).map(([ts, entries]) => (
                <div
                  key={ts}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] py-4"
                >
                  <div className="text-[13px] text-mute">{formatDate(ts)}</div>
                  <div className="flex flex-1 flex-wrap justify-end gap-2">
                    {entries.map((entry) => {
                      const meta = data.tokens[entry.mint];
                      return (
                        <span
                          key={entry.signature}
                          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--fill-soft)] py-1 pl-1 pr-3 text-[13px] font-medium text-ink"
                        >
                          <TokenIcon symbol={meta?.symbol ?? "?"} imageUrl={meta?.imageUrl} />
                          {meta?.symbol ?? entry.mint.slice(0, 4)}{" "}
                          <span className="font-normal text-mute">
                            {formatTokenAmount(entry.netRaw, meta?.decimals ?? 6)}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <a
                href={LINKS.claims}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-mute hover:text-ink2"
              >
                See full history on stonk5.com ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
