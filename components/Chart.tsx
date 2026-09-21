"use client";

import { useEffect, useState } from "react";
import { DEX_CHAIN, LINKS, PAIR_ADDRESS } from "@/lib/constants";

export default function Chart() {
  // A cache-busting value, regenerated on mount and on manual reload. The
  // embed URL is otherwise a static string, so a browser that cached a
  // previously-stuck "Loading pair..." response for it can keep serving
  // that same broken response on later visits without this.
  const [reloadKey, setReloadKey] = useState(() => Date.now());
  const src = `https://dexscreener.com/${DEX_CHAIN}/${PAIR_ADDRESS}?embed=1&theme=dark&trades=0&info=0&_=${reloadKey}`;

  // The first load of the embed often gets stuck on "Loading pair..." but a
  // remount (same trigger as the Reload chart button) reliably fixes it, so
  // do that once automatically shortly after the page loads.
  useEffect(() => {
    const timer = setTimeout(() => setReloadKey(Date.now()), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="glass overflow-hidden p-2">
      <div className="flex items-center justify-between gap-3 px-4 pt-3">
        <div className="flex items-baseline gap-2">
          <div className="label">Chart</div>
          <span className="text-[11px] text-mute">
            If stuck, press Reload chart.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setReloadKey(Date.now())}
            className="text-[13px] text-mute hover:text-ink2"
          >
            Reload chart
          </button>
          <a
            href={LINKS.dexscreener}
            target="_blank"
            rel="noreferrer"
            className="text-[13px] text-mute hover:text-ink2"
          >
            Open on DexScreener ↗
          </a>
        </div>
      </div>
      <iframe
        key={reloadKey}
        src={src}
        title="STONK5 price chart"
        className="mt-2 h-[420px] w-full rounded-[16px] sm:h-[500px]"
      />
    </div>
  );
}
