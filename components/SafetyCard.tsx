import type { OnchainStats } from "@/lib/types";

function SafetyRow({ label, ok, okLabel, badLabel }: { label: string; ok: boolean; okLabel: string; badLabel: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-navy-200">{label}</span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          ok ? "bg-sky-500/20 text-sky-400" : "bg-slate-500/20 text-slate-400"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-sky-400" : "bg-slate-400"}`} />
        {ok ? okLabel : badLabel}
      </span>
    </div>
  );
}

export default function SafetyCard({ onchain }: { onchain: OnchainStats | null }) {
  if (!onchain) {
    return (
      <div className="rounded-3xl border border-navy-700/60 bg-navy-800/50 p-6 shadow-card">
        <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
          On-chain safety
        </div>
        <p className="mt-2 text-sm text-navy-400">
          On-chain data unavailable right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-navy-700/60 bg-navy-800/50 p-6 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        On-chain safety
      </div>
      <div className="mt-2 divide-y divide-navy-700/60">
        <SafetyRow
          label="Mint authority"
          ok={onchain.mintAuthorityRenounced}
          okLabel="Renounced"
          badLabel="Active"
        />
        <SafetyRow
          label="Freeze authority"
          ok={onchain.freezeAuthorityRenounced}
          okLabel="Renounced"
          badLabel="Active"
        />
      </div>
      {onchain.holderConcentration && (
        <div className="mt-3 border-t border-navy-700/60 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-navy-200">
              Top {onchain.holderConcentration.accountsSampled} accounts hold
            </span>
            <span className="font-mono text-sm tabular-nums text-navy-50">
              {onchain.holderConcentration.topHolderPercent.toFixed(1)}%
            </span>
          </div>
          <p className="mt-1 text-xs text-navy-500">
            Includes the liquidity pool and engine-controlled accounts, not
            just individual holders.
          </p>
        </div>
      )}
      <p className="mt-3 text-xs text-navy-500">
        Renounced authorities mean supply can&apos;t be minted further and
        accounts can&apos;t be frozen &mdash; read directly off the mint account.
      </p>
    </div>
  );
}
