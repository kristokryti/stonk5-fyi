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
    <div className="rounded-xl border border-navy-700 bg-navy-800/60 p-4">
      <div className="text-xs uppercase tracking-wide text-navy-400">
        Price change
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {WINDOWS.map(({ key, label }) => {
          const value = priceChange[key];
          return (
            <div key={key} className="text-center">
              <div className="text-xs text-navy-400">{label}</div>
              <div
                className={`mt-1 font-mono text-sm ${
                  value === null
                    ? "text-navy-400"
                    : value >= 0
                      ? "text-teal-soft"
                      : "text-accent-hover"
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
