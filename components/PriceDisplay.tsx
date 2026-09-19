import { formatCompactPrice, formatUsd } from "@/lib/format";

export default function PriceDisplay({ value, className = "" }: { value: number | null; className?: string }) {
  if (value === null) {
    return <span className={className}>—</span>;
  }

  const compact = formatCompactPrice(value);
  if (!compact) {
    return <span className={className}>{formatUsd(value)}</span>;
  }

  return (
    <span className={className}>
      {compact.prefix}
      <sub className="mx-px text-[0.5em]">{compact.zeroCount}</sub>
      {compact.digits}
    </span>
  );
}
