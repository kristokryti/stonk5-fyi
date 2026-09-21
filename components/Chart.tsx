"use client";

import { useEffect, useRef, useState } from "react";
import { DEX_CHAIN, LINKS, PAIR_ADDRESS } from "@/lib/constants";

export default function Chart() {
  // A cache-busting value, regenerated on mount and on manual reload. The
  // embed URL is otherwise a static string, so a browser that cached a
  // previously-stuck "Loading pair..." response for it can keep serving
  // that same broken response on later visits without this.
  const [reloadKey, setReloadKey] = useState(() => Date.now());
  const src = `https://dexscreener.com/${DEX_CHAIN}/${PAIR_ADDRESS}?embed=1&theme=dark&trades=0&info=0&_=${reloadKey}`;
  const reloadButtonRef = useRef<HTMLButtonElement>(null);

  // DexScreener's embed is a cross-origin iframe, so the browser's
  // same-origin policy blocks us from ever reading its content — there is
  // no way to actually detect the text "Loading pair..." from this page.
  // The closest honest substitute: retry the same reload a few times on a
  // back-off schedule (1s, 4s, 9s after mount) instead of only once, then
  // stop — most stuck loads clear within the first retry or two, and
  // reloading indefinitely would just be disruptive for a chart that's
  // already working fine.
  useEffect(() => {
    const delays = [1000, 4000, 9000];
    const timers = delays.map((ms) =>
      setTimeout(() => reloadButtonRef.current?.click(), ms)
    );
    return () => timers.forEach(clearTimeout);
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
            ref={reloadButtonRef}
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
