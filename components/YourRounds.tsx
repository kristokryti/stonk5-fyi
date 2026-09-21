"use client";

import { useState } from "react";
import { LINKS } from "@/lib/constants";
import { formatDate, proxiedTokenImage } from "@/lib/format";
import type { ClaimsPayoutEntry, ClaimsResponse } from "@/lib/types";

function formatTokenAmount(raw: string, decimals: number): string {
  const value = Number(raw) / 10 ** decimals;
  if (!Number.isFinite(value)) return "—";
  const maximumFractionDigits = value < 1 ? 6 : value < 1000 ? 2 : 0;
  return value.toLocaleString("en-US", { maximumFractionDigits });
}

function openStatusLabel(status: string): string {
  if (status === "below-minimum-payout") return "Below delivery floor";
  if (status === "cost-exceeds-value") return "Delivery cost too high";
  return "Carried to next round";
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

  return (
    <section id="your-rewards" className="wrap mt-16 sm:mt-22">
      <h2>Your rewards</h2>
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
            placeholder="Solana wallet address, e.g. H5GnZkkaW2Ph2fVWbNP6PdppaVFSHiRP18nSvjtyX4qY"
            className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[var(--fill-soft)] px-4 py-3 font-mono text-[13px] text-ink placeholder:text-mute focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--c2)]"
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            {loading ? "Looking up…" : "See rewards"}
          </button>
        </form>

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

            {openEntries.length > 0 && (
              <div className="mt-6">
                <div className="label">Carried — not yet delivered</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {openEntries.map(([mint, entry]) => {
                    const meta = data.tokens[mint];
                    return (
                      <span
                        key={mint}
                        title={entry.detail}
                        className="chip inline-flex items-center gap-2"
                      >
                        <TokenIcon symbol={meta?.symbol ?? "?"} imageUrl={meta?.imageUrl} />
                        {meta?.symbol ?? mint.slice(0, 4)} · {openStatusLabel(entry.status)}
                      </span>
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
