"use client";

import { useStats } from "@/lib/statsContext";
import { formatCompactNumber } from "@/lib/format";

export default function BuybackBurn() {
  const { stats } = useStats();
  const onchain = stats?.onchain ?? null;

  return (
    <section className="wrap mt-16 sm:mt-22">
      <div className="glass p-8">
        <div className="label">Buyback &amp; burn</div>
        <h3 className="mt-2">5% of every round burns $STONK5 forever.</h3>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink2">
          Alongside the 95% that buys the top 5 basket for holders, the
          engine takes 5% of each round&apos;s rewards, buys $STONK5 on the
          open market, and burns it — permanently removing it from
          circulation.
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
      </div>
    </section>
  );
}
