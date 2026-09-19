export default function LiquidityHealth({
  liquidityUsd,
  marketCapUsd,
  volume24hUsd,
}: {
  liquidityUsd: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
}) {
  const liqToMcap =
    liquidityUsd && marketCapUsd ? (liquidityUsd / marketCapUsd) * 100 : null;
  const volToLiq =
    volume24hUsd && liquidityUsd ? volume24hUsd / liquidityUsd : null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-navy-800 p-5 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        Liquidity health
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="text-lg font-bold tabular-nums text-navy-50">
            {liqToMcap !== null ? `${liqToMcap.toFixed(1)}%` : "—"}
          </div>
          <div className="text-xs text-navy-400">Liquidity / market cap</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums text-navy-50">
            {volToLiq !== null ? `${volToLiq.toFixed(1)}×` : "—"}
          </div>
          <div className="text-xs text-navy-400">24h volume / liquidity</div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-navy-500">
        A very low liquidity/mcap ratio or an extreme volume/liquidity
        multiple are common early flags for thin or wash-traded markets —
        context, not a verdict.
      </p>
    </div>
  );
}
