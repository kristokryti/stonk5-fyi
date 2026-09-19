import { LINKS } from "@/lib/constants";

export default function BuyButton({ full = false }: { full?: boolean }) {
  return (
    <a
      href={LINKS.stonkfun}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center justify-center gap-2 rounded-full bg-navy-300 px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-card transition-colors hover:bg-navy-200 active:scale-[0.98] ${
        full ? "w-full" : "w-full sm:w-auto"
      }`}
    >
      Buy $STONK5
    </a>
  );
}
