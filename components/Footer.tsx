"use client";

import { useStats } from "@/lib/statsContext";
import { formatRelativeTime } from "@/lib/format";

export default function Footer() {
  const { stats, stale } = useStats();

  return (
    <footer className="wrap mt-16 space-y-1.5 pb-16 text-[13px] text-mute sm:mt-22">
      <p className={stale ? "text-[var(--neg)]" : undefined}>
        {stats
          ? `Updated ${formatRelativeTime(stats.updatedAt)}`
          : "No live data"}{" "}
        · price &amp; volume from DexScreener, status &amp; launch data from
        stonkfun.xyz, burns &amp; authorities verified on-chain.
      </p>
      <p>
        <strong className="font-medium text-ink2">
          Unofficial community tracker
        </strong>{" "}
        for STONK5. Not affiliated with StonkFun or the STONK5 team. Not
        financial advice.
      </p>
    </footer>
  );
}
