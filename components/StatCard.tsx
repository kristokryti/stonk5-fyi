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
    <div className="rounded-2xl border border-white/[0.08] bg-navy-800 p-5 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
        {label}
      </div>
      <div
        className={`mt-1.5 font-sans text-xl font-extrabold tracking-tight tabular-nums ${
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
