import { formatPercent, formatUsd } from "@/lib/format";
import type { BasketToken } from "@/lib/types";

export default function BasketList({
  basket,
  avgChange24h,
  totalMarketCapUsd,
}: {
  basket: BasketToken[] | null;
  avgChange24h?: number | null;
  totalMarketCapUsd?: number | null;
}) {
  if (!basket || basket.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-navy-800 p-6 shadow-card">
        <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
          Current basket
        </div>
        <p className="mt-2 text-sm text-navy-400">
          Basket data unavailable right now.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-navy-800 p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-navy-400">
            Current basket &mdash; what the next round would buy
          </div>
          <p className="mt-1.5 text-xs text-navy-500">
            StonkFun&apos;s top 5 tokens by market cap right now, 19% of the
            round each. Re-evaluated every round.
          </p>
        </div>
        {avgChange24h != null && (
          <div className="shrink-0 text-right">
            <div
              className={`text-sm font-bold tabular-nums ${
                avgChange24h >= 0 ? "text-sky-400" : "text-slate-400"
              }`}
            >
              {formatPercent(avgChange24h)}
            </div>
            <div className="text-[10px] text-navy-500">basket avg 24h</div>
          </div>
        )}
      </div>
      {totalMarketCapUsd != null && (
        <p className="mt-2 text-xs text-navy-500">
          Combined market cap of the basket:{" "}
          <span className="font-semibold text-navy-300">
            {formatUsd(totalMarketCapUsd, { compact: true })}
          </span>
        </p>
      )}
      <ul className="mt-4 divide-y divide-white/[0.08]">
        {basket.map((token, i) => (
          <li key={token.mint} className="flex items-center gap-3 py-2.5">
            <span className="w-4 text-xs text-navy-500">{i + 1}</span>
            {token.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={token.imageUrl}
                alt=""
                width={28}
                height={28}
                loading="lazy"
                className="h-7 w-7 rounded-full border border-navy-700 object-cover"
              />
            ) : (
              <div className="h-7 w-7 rounded-full border border-navy-700 bg-navy-700" />
            )}
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-navy-100">
                {token.symbol}
              </div>
            </div>
            <div className="text-right font-sans text-sm tabular-nums text-navy-100">
              {formatUsd(token.marketCapUsd, { compact: true })}
            </div>
            <div
              className={`w-16 text-right font-sans text-xs tabular-nums ${
                token.priceChange24h === null
                  ? "text-navy-400"
                  : token.priceChange24h >= 0
                    ? "text-sky-400"
                    : "text-slate-400"
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
