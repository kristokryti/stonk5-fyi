import { LINKS } from "@/lib/constants";

export default function BuyButton({ full = false }: { full?: boolean }) {
  return (
    <a
      href={LINKS.stonkfun}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center justify-center gap-2 rounded-full bg-action px-5 py-2.5 text-sm font-medium text-white shadow-[0_1px_2px_rgb(0_0_0/0.3),0_4px_16px_-4px_rgb(37_99_235/0.5)] transition-all hover:bg-action-hover hover:shadow-[0_1px_2px_rgb(0_0_0/0.3),0_6px_20px_-4px_rgb(37_99_235/0.65)] active:scale-[0.98] ${
        full ? "w-full" : "w-full sm:w-auto"
      }`}
    >
      Buy STONK5 with SOL
    </a>
  );
}
