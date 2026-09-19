import type { TimeframeStats } from "@/lib/types";

export default function VolatilityCard({
  priceChange,
}: {
  priceChange: TimeframeStats | null;
}) {
  const values = priceChange
    ? Object.values(priceChange).filter((v): v is number => v !== null)
    : [];
  const volatility =
    values.length > 0
      ? values.reduce((sum, v) => sum + Math.abs(v), 0) / values.length
      : null;

  let label = "—";
  if (volatility !== null) {
    if (volatility < 5) label = "Calm";
    else if (volatility < 20) label = "Active";
    else label = "Wild";
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-navy-800 p-5 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        Volatility
      </div>
      <div className="mt-3 flex items-baseline gap-2.5">
        <div className="text-lg font-bold tabular-nums text-navy-50">
          {volatility !== null ? `${volatility.toFixed(1)}%` : "—"}
        </div>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-navy-400">
          {label}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-navy-500">
        Average absolute price swing across 5m/1h/6h/24h &mdash; how much
        the price is actually moving right now, regardless of direction.
      </p>
    </div>
  );
}
