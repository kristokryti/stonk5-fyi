import { DEX_CHAIN, LINKS, PAIR_ADDRESS } from "@/lib/constants";

export default function Chart() {
  const src = `https://dexscreener.com/${DEX_CHAIN}/${PAIR_ADDRESS}?embed=1&theme=dark&trades=0&info=0`;

  return (
    <div className="glass overflow-hidden p-2">
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="label">Chart</div>
        <a
          href={LINKS.dexscreener}
          target="_blank"
          rel="noreferrer"
          className="text-[13px] text-mute hover:text-ink2"
        >
          Open on DexScreener ↗
        </a>
      </div>
      <iframe
        src={src}
        title="STONK5 price chart"
        className="mt-2 h-[420px] w-full rounded-[16px] sm:h-[500px]"
      />
    </div>
  );
}
