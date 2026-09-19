import { DEX_CHAIN, PAIR_ADDRESS } from "@/lib/constants";

export default function Chart() {
  const src = `https://dexscreener.com/${DEX_CHAIN}/${PAIR_ADDRESS}?embed=1&theme=dark&trades=0&info=0`;

  return (
    <div className="overflow-hidden rounded-xl border border-navy-700">
      <iframe
        src={src}
        title="STONK5 price chart"
        className="h-[420px] w-full sm:h-[500px]"
        loading="lazy"
      />
    </div>
  );
}
