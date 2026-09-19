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
    <div className="rounded-[20px] border border-white/[0.08] bg-navy-800/50 p-5 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        {label}
      </div>
      <div
        className={`mt-1.5 font-mono text-xl font-medium tabular-nums ${
          accent === "up"
            ? "text-sky-400"
            : accent === "down"
              ? "text-slate-400"
              : "text-navy-50"
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-navy-400">{sub}</div> : null}
    </div>
  );
}
