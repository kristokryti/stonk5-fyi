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
    <div className="rounded-xl border border-navy-700 bg-navy-800/60 p-4">
      <div className="text-xs uppercase tracking-wide text-navy-400">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-xl font-medium ${
          accent === "up"
            ? "text-teal-soft"
            : accent === "down"
              ? "text-accent-hover"
              : "text-navy-50"
        }`}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-xs text-navy-400">{sub}</div> : null}
    </div>
  );
}
