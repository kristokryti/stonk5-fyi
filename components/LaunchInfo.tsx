import { formatDateShort, formatDuration, formatMultiplier, shortenAddress } from "@/lib/format";
import { LINKS } from "@/lib/constants";
import type { LaunchInfo as LaunchInfoType } from "@/lib/types";

export default function LaunchInfo({
  launch,
  marketCapUsd,
  peakMarketCapUsd,
}: {
  launch: LaunchInfoType | null;
  marketCapUsd: number | null;
  peakMarketCapUsd: number | null;
}) {
  if (!launch) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-navy-800 p-6 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        Launch
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <div className="font-mono text-sm tabular-nums text-navy-50">
            {formatDateShort(launch.createdAt)}
          </div>
          <div className="text-xs text-navy-400">Launched</div>
        </div>
        <div>
          <div className="font-mono text-sm tabular-nums text-navy-50">
            {formatDuration(launch.createdAt, launch.graduatedAt)}
          </div>
          <div className="text-xs text-navy-400">Time to graduate</div>
        </div>
        <div>
          <div className="font-mono text-sm tabular-nums text-sky-400">
            {formatMultiplier(marketCapUsd, launch.startMarketCapUsd)}
          </div>
          <div className="text-xs text-navy-400">Since launch</div>
        </div>
        <div>
          <div className="font-mono text-sm tabular-nums text-navy-50">
            {peakMarketCapUsd && marketCapUsd
              ? `-${(100 - (marketCapUsd / peakMarketCapUsd) * 100).toFixed(0)}%`
              : "—"}
          </div>
          <div className="text-xs text-navy-400">From peak mcap</div>
        </div>
      </div>
      <a
        href={LINKS.solscanEngineWallet}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-block font-mono text-xs text-navy-400 underline decoration-navy-600 underline-offset-4 transition-colors hover:text-sky-300"
      >
        Engine wallet: {shortenAddress(launch.creator)}
      </a>
    </div>
  );
}
