import { formatDate, formatDuration, formatMultiplier, shortenAddress } from "@/lib/format";
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
    <div className="rounded-xl border border-navy-700 bg-navy-800/60 p-5">
      <div className="text-xs uppercase tracking-wide text-navy-400">
        Launch
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <div className="font-mono text-sm text-navy-50">
            {formatDate(launch.createdAt)}
          </div>
          <div className="text-xs text-navy-400">Launched</div>
        </div>
        <div>
          <div className="font-mono text-sm text-navy-50">
            {formatDuration(launch.createdAt, launch.graduatedAt)}
          </div>
          <div className="text-xs text-navy-400">Time to graduate</div>
        </div>
        <div>
          <div className="font-mono text-sm text-teal-soft">
            {formatMultiplier(marketCapUsd, launch.startMarketCapUsd)}
          </div>
          <div className="text-xs text-navy-400">Since launch</div>
        </div>
        <div>
          <div className="font-mono text-sm text-navy-50">
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
        className="mt-3 inline-block font-mono text-xs text-navy-400 underline decoration-navy-600 underline-offset-2 hover:text-teal"
      >
        Engine wallet: {shortenAddress(launch.creator)}
      </a>
    </div>
  );
}
