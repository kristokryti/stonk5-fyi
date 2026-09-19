import { ROUND_SOL_THRESHOLD } from "@/lib/constants";
import { formatCompactNumber } from "@/lib/format";
import type { OnchainStats } from "@/lib/types";

export default function EngineStatus({
  onchain,
}: {
  onchain: OnchainStats | null;
}) {
  if (!onchain) {
    return (
      <div className="rounded-[28px] border border-white/[0.08] bg-navy-800/50 p-6 shadow-card">
        <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
          Engine & burns
        </div>
        <p className="mt-2 text-sm text-navy-400">
          On-chain data unavailable right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-white/[0.08] bg-navy-800/50 p-6 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        Engine round progress
      </div>
      <div className="mt-2.5 flex items-baseline justify-between font-mono text-sm tabular-nums text-navy-100">
        <span>{onchain.engineWalletSol.toFixed(3)} SOL</span>
        <span className="text-navy-400">/ {ROUND_SOL_THRESHOLD} SOL</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-navy-700/80">
        <div
          className="h-full rounded-full bg-action transition-all"
          style={{ width: `${onchain.roundProgressPercent}%` }}
        />
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-navy-400">
        Fees toward the next buy-basket-and-burn round (5 SOL, or every 5h,
        whichever comes first).
      </p>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/[0.08] pt-4">
        <div>
          <div className="font-mono text-lg tabular-nums text-navy-50">
            {formatCompactNumber(onchain.burnedTokens)}
          </div>
          <div className="text-xs text-navy-400">STONK5 burned</div>
        </div>
        <div>
          <div className="font-mono text-lg tabular-nums text-navy-50">
            {onchain.burnedPercent.toFixed(3)}%
          </div>
          <div className="text-xs text-navy-400">of issued supply</div>
        </div>
      </div>
      <p className="mt-2.5 text-xs text-navy-500">
        Verified on-chain: 1,000,000,000 issued minus current supply.
      </p>
    </div>
  );
}
