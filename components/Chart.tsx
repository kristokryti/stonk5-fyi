import { LINKS } from "@/lib/constants";

export default function Chart() {
  return (
    <div className="glass overflow-hidden p-2">
      <div className="label px-4 pt-3">Chart</div>
      <div className="mt-2 flex h-[420px] w-full flex-col items-center justify-center gap-4 rounded-[16px] bg-black/20 px-6 text-center sm:h-[500px]">
        <p className="max-w-[36ch] text-sm text-ink2">
          DexScreener&apos;s embedded chart doesn&apos;t reliably load inside
          an iframe here — view it directly on their site instead.
        </p>
        <a
          href={LINKS.dexscreener}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost btn-sm"
        >
          Live chart on DexScreener ↗
        </a>
      </div>
    </div>
  );
}
