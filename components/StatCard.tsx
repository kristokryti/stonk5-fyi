export default function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: "up" | "down";
}) {
  return (
    <div className="rounded-2xl border border-navy-150 bg-white p-5 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
        {label}
      </div>
      <div
        className={`mt-1.5 font-mono text-xl font-medium tabular-nums ${
          accent === "up"
            ? "text-teal-deep"
            : accent === "down"
              ? "text-accent-hover"
              : "text-navy-900"
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-navy-400">{sub}</div> : null}
    </div>
  );
}
