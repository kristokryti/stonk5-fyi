"use client";

import { useStats } from "@/lib/statsContext";

function CheckRow({ label, ok }: { label: string; ok: boolean | null }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm text-ink2">{label}</span>
      {ok === null ? (
        <span className="chip">—</span>
      ) : ok ? (
        <span className="chip chip-pos">✓ Renounced</span>
      ) : (
        <span className="chip chip-neg">✗ Not renounced</span>
      )}
    </div>
  );
}

export default function SafetyCard() {
  const { stats } = useStats();
  const onchain = stats?.onchain ?? null;
  const holderConcentration = onchain?.holderConcentration ?? null;

  return (
    <section className="wrap mt-16 sm:mt-22">
      <div className="glass p-8">
        <div className="label">On-chain safety</div>
        <h3 className="mt-2">Verified directly on Solana, not self-reported.</h3>
        <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink2">
          These checks are read straight from the mint account and top token
          accounts — the same way any block explorer would verify them.
        </p>

        <div className="mt-5 divide-y divide-[var(--line)]">
          <CheckRow
            label="Mint authority"
            ok={onchain ? onchain.mintAuthorityRenounced : null}
          />
          <CheckRow
            label="Freeze authority"
            ok={onchain ? onchain.freezeAuthorityRenounced : null}
          />
        </div>

        <div className="mt-5">
          <div className="label">Top 10 holders</div>
          <div className="num mt-1 text-2xl font-semibold text-ink">
            {holderConcentration
              ? `${holderConcentration.topHolderPercent.toFixed(1)}%`
              : "—"}
          </div>
          <div className="mt-0.5 text-[13px] text-mute">
            {holderConcentration
              ? "of total supply, sampled from the largest token accounts"
              : "Unavailable right now"}
          </div>
          {holderConcentration && (
            <div className="bar mt-3 max-w-[400px]">
              <i style={{ width: `${Math.min(100, holderConcentration.topHolderPercent)}%` }} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
