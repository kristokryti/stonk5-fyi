import { formatPercent, formatUsd } from "@/lib/format";
import type { BasketToken } from "@/lib/types";

export default function BasketList({ basket }: { basket: BasketToken[] | null }) {
  if (!basket || basket.length === 0) {
    return (
      <div className="rounded-2xl border border-navy-150 bg-white p-6 shadow-card">
        <div className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
          Current basket
        </div>
        <p className="mt-2 text-sm text-navy-400">
          Basket data unavailable right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy-150 bg-white p-6 shadow-card">
      <div className="text-[11px] font-medium uppercase tracking-wider text-navy-500">
        Current basket &mdash; what the next round would buy
      </div>
      <p className="mt-1.5 text-xs text-navy-400">
        StonkFun&apos;s top 5 tokens by market cap right now, 19% of the
        round each. Re-evaluated every round.
      </p>
      <ul className="mt-4 divide-y divide-navy-150">
        {basket.map((token, i) => (
          <li key={token.mint} className="flex items-center gap-3 py-2.5">
            <span className="w-4 text-xs text-navy-400">{i + 1}</span>
            {token.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={token.imageUrl}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                className="h-7 w-7 rounded-full border border-navy-150 object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full border border-navy-150 bg-navy-100" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-navy-800">
                {token.symbol}
              </div>
            </div>
            <div className="text-right font-mono text-sm tabular-nums text-navy-800">
              {formatUsd(token.marketCapUsd, { compact: true })}
            </div>
            <div
              className={`w-16 text-right font-mono text-xs tabular-nums ${
                token.priceChange24h === null
                  ? "text-navy-400"
                  : token.priceChange24h >= 0
                    ? "text-teal-deep"
                    : "text-accent-hover"
              }`}
            >
              {formatPercent(token.priceChange24h)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
