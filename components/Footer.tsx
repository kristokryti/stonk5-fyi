"use client";

import { useStats } from "@/lib/statsContext";
import { formatRelativeTime } from "@/lib/format";
import { LINKS } from "@/lib/constants";

export default function Footer() {
  const { stats, stale } = useStats();

  return (
    <footer className="wrap mt-16 space-y-1.5 pb-16 text-[13px] text-mute sm:mt-22">
      <p className={stale ? "text-[var(--neg)]" : undefined}>
        {stats
          ? `Updated ${formatRelativeTime(stats.updatedAt)}`
          : "No live data"}{" "}
        · price &amp; volume from DexScreener, chart &amp; buyer/seller data
        from GeckoTerminal, status &amp; launch data from stonkfun.xyz,
        round &amp; lock data from stonk5.com&apos;s own engine, burns &amp;
        authorities verified on-chain.
      </p>
      <p>
        <a
          href={LINKS.siteTwitter}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ink2 underline hover:text-ink"
        >
          Unofficial community tracker
        </a>{" "}
        for STONK5. Not affiliated with StonkFun or the STONK5 team. Not
        financial advice.
      </p>
    </footer>
  );
}
