"use client";

import { useStats } from "@/lib/statsContext";
import { formatCompactNumber } from "@/lib/format";
import { LINKS } from "@/lib/constants";

export default function BuybackBurn() {
  const { stats } = useStats();
  const onchain = stats?.onchain ?? null;

  return (
    <section className="wrap mt-16 sm:mt-22">
      <div className="glass p-8">
        <div className="label">Burn &amp; lock</div>
        <h3 className="mt-2">Every round burns 5% and locks 5% of $STONK5.</h3>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink2">
          Funded from the basket&apos;s share (18% to each of the top 5,
          instead of 19%) — not from what holders are paid. 5% of each
          round buys $STONK5 and burns it forever. Another 5% buys $STONK5
          and sends it to a vault that locks into a 5-year Jupiter Lock
          escrow every week — no cancel authority, a fixed recipient, and
          it can&apos;t be pulled forward.
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

        <a
          href={LINKS.burnLock}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block text-[13px] text-mute hover:text-ink2"
        >
          Track the vault &amp; every lock on stonk5.com ↗
        </a>
      </div>
    </section>
  );
}
