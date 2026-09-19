import type { TimeframeStats as TimeframeStatsType } from "@/lib/types";
import { formatPercent } from "@/lib/format";

const WINDOWS: { key: keyof TimeframeStatsType; label: string }[] = [
  { key: "m5", label: "5m" },
  { key: "h1", label: "1h" },
  { key: "h6", label: "6h" },
  { key: "h24", label: "24h" },
];

export default function TimeframeStats({
  priceChange,
}: {
  priceChange: TimeframeStatsType | null;
}) {
  if (!priceChange) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-navy-800 p-5 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        Price change
      </div>
      <div className="mt-3 grid grid-cols-4 divide-x divide-white/[0.08]">
        {WINDOWS.map(({ key, label }) => {
          const value = priceChange[key];
          return (
            <div key={key} className="text-center">
              <div className="text-xs text-navy-400">{label}</div>
              <div
                className={`mt-1 font-sans text-sm tabular-nums ${
                  value === null
                    ? "text-navy-400"
                    : value >= 0
                      ? "text-sky-400"
                      : "text-slate-400"
                }`}
              >
                {formatPercent(value)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
